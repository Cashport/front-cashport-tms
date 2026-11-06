import { HR, MIN, toMs } from "../lib/time";
import type {
  ApiPosition,
  IApiFleet,
  IApiHistory,
  IApiTrip,
  IApiTripDetail
} from "../types/vehicleTowerApi";
import type { IVehicleTowerPing } from "../types/vehicleTower";
import { buildMockUnassignedTrs } from "./curatedFleet";
import { buildMockTrips } from "./genFleet";
import { mockPosAt, mockStopTimes } from "./mockSim";
import type { IMockSegment, IMockTrip } from "./mockSim";

const VEHICLE_ID_BASE = 700000;
const RECENT_MS = 35 * MIN;
const TRAIL_MS = 24 * HR;
const TRAIL_STEP_MS = 10 * MIN;
const HISTORY_STEP_MS = 5 * MIN;
const MISSING_PHONE_EVERY = 5;
const UNAVAILABLE_SERVICES_EVERY = 7;

interface IMockEntry {
  trip: IMockTrip;
  tripId: number;
  vehicleId: number;
}

const entries = (now: Date): IMockEntry[] =>
  buildMockTrips(now).map((trip, i) => {
    const vehicleId = VEHICLE_ID_BASE + i;
    return { trip, vehicleId, tripId: trip.transferRequest ? trip.tripId : -vehicleId };
  });

const trNumber = (id: string): string => id.replace(/^TR-/, "");

function capacityOf(text: string): { kgCapacity: number | null; passengerCapacity: number | null } {
  const pax = /^(\d+) pasajeros/.exec(text);
  if (pax) return { kgCapacity: null, passengerCapacity: Number(pax[1]) };
  const tons = parseFloat(text.replace(",", "."));
  return { kgCapacity: Number.isFinite(tons) ? tons * 1000 : null, passengerCapacity: null };
}

const pingAt = (trip: IMockTrip, at: number): IVehicleTowerPing => {
  const [lng, lat] = mockPosAt(trip, at);
  return { lat, lng, date: new Date(at).toISOString() };
};

const lastPingMs = (trip: IMockTrip, nowMs: number): number =>
  Math.min(nowMs, toMs(trip.lastPing.date));

function sample(trip: IMockTrip, from: number, to: number, step: number): IVehicleTowerPing[] {
  const pts: IVehicleTowerPing[] = [];
  for (let k = from; k <= to; k += step) pts.push(pingAt(trip, k));
  return pts;
}

function lastAppEvent(trip: IMockTrip, nowMs: number): string | null {
  const at = trip.appEvents
    .filter((e) => e.fromApp && toMs(e.eventTime) <= nowMs)
    .map((e) => toMs(e.eventTime));
  return at.length ? new Date(Math.max(...at)).toISOString() : null;
}

function mergedSegments(trip: IMockTrip): IMockSegment[] {
  const out: IMockSegment[] = [];
  for (const x of trip.segments) {
    const prev = out[out.length - 1];
    if (prev?.state === x.state) out[out.length - 1] = { ...prev, to: x.to };
    else out.push(x);
  }
  return out;
}

function toApiTrip({ trip, tripId, vehicleId }: IMockEntry, nowMs: number, at: number): IApiTrip {
  const { capacity, ...vehicle } = trip.vehicle;
  const { servicesThisYear, ...driver } = trip.driver;
  const tr = trip.transferRequest;
  const times = mockStopTimes(trip, at);
  const segs = tr ? mergedSegments(trip).filter((x) => toMs(x.from) <= at) : [];
  const ping = lastPingMs(trip, nowMs);
  return {
    tripId,
    vehicleId,
    stateId: trip.stateId,
    transferRequest: tr
      ? {
          id: trNumber(tr.id),
          internalId: Number(trNumber(tr.id)),
          startDate: tr.startDate,
          fixedRate: tr.fixedRate
        }
      : null,
    stops: trip.stops.map((s, i) => ({ ...s, ...times[i] })),
    carrier: trip.carrier,
    vehicle: { ...vehicle, ...capacityOf(capacity) },
    driver: { ...driver, licenseExpiration: null },
    requester: trip.requester && {
      ...trip.requester,
      phone: tripId % MISSING_PHONE_EVERY === 0 ? null : trip.requester.phone
    },
    analyst: trip.analyst,
    psl: trip.psl,
    client: trip.client,
    vp: trip.vp,
    cost: trip.cost,
    segments: segs.map((x, i) => ({
      state: x.state,
      from: x.from,
      to: i === segs.length - 1 ? null : x.to
    })),
    lastPing: pingAt(trip, ping),
    recentPings: sample(trip, ping - RECENT_MS, ping, HISTORY_STEP_MS),
    lastFollowUp: trip.lastFollowUp,
    lastAppEventAt: lastAppEvent(trip, nowMs),
    lastNoveltyAt: null
  };
}

export function getMockFleet(now: Date): IApiFleet {
  const nowMs = now.getTime();
  return {
    params: { sbHoras: 4 },
    trips: entries(now).map((e) => toApiTrip(e, nowMs, nowMs)),
    trsSinVehiculo: buildMockUnassignedTrs(now).map((x) => ({
      ...x,
      transferRequest: trNumber(x.transferRequest)
    }))
  };
}

export function getMockTripDetail(tripId: number, now: Date): IApiTripDetail {
  const nowMs = now.getTime();
  const entry = entries(now).find((e) => e.tripId === tripId);
  if (!entry) throw new Error("No se encontró el viaje");
  const { trip } = entry;
  const first = trip.segments[0] ? toMs(trip.segments[0].from) : nowMs;
  return {
    tripId,
    routeGeometry: trip.routeGeometry,
    trail: trip.transferRequest
      ? sample(trip, Math.max(nowMs - TRAIL_MS, first), lastPingMs(trip, nowMs), TRAIL_STEP_MS)
      : [],
    observations: trip.transferRequest?.observations ?? null,
    servicesThisYear:
      tripId % UNAVAILABLE_SERVICES_EVERY === 0 ? "Proximamente" : trip.driver.servicesThisYear,
    documents: trip.documents,
    materials: trip.materials,
    passengers: trip.passengers,
    followUps: trip.followUps,
    appEvents: trip.appEvents,
    logEvents: trip.logEvents ?? []
  };
}

export function getMockHistory(from: number, to: number, now: Date): IApiHistory {
  const nowMs = now.getTime();
  return {
    from: new Date(from).toISOString(),
    to: new Date(to).toISOString(),
    trips: entries(now).map((e) => {
      const positions: ApiPosition[] = sample(
        e.trip,
        from,
        Math.min(to, lastPingMs(e.trip, nowMs)),
        HISTORY_STEP_MS
      ).map((x) => [toMs(x.date), x.lng, x.lat]);
      return {
        ...toApiTrip(e, nowMs, to),
        positions,
        followUps: e.trip.followUps,
        appEvents: e.trip.appEvents
      };
    })
  };
}
