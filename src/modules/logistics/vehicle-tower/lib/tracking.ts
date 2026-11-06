import type {
  IVehicleTowerPing,
  IVehicleTowerStop,
  IVehicleTowerTrip,
  TowerScreenState,
  TowerSegmentState
} from "../types/vehicleTower";
import { ago, HR, MIN, toMs } from "./time";

export type LngLat = [number, number];

export interface ITrackSegment {
  state: TowerSegmentState;
  from: number;
  to: number;
}

interface ISegmentSource {
  segments: Array<{ state: TowerSegmentState; from: string; to: string | null }>;
}

export type StopStatus = "done" | "here" | "pend";

export const NO_FOLLOW_UP = -1e9 * HR;

const RECENT_MS = 35 * MIN;

export const dist = (a: LngLat, b: LngLat): number => {
  const R = 6371;
  const r = Math.PI / 180;
  const dl = (b[1] - a[1]) * r;
  const dn = (b[0] - a[0]) * r;
  const x = Math.sin(dl / 2) ** 2 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.sin(dn / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

interface IRouteMetrics {
  cum: number[];
  total: number;
}

export const routeMetrics = (path: LngLat[]): IRouteMetrics => {
  const cum = [0];
  for (let j = 1; j < path.length; j++) cum.push(cum[j - 1] + dist(path[j - 1], path[j]));
  return { cum, total: cum[cum.length - 1] };
};

export const nearestFrac = (path: LngLat[], metrics: IRouteMetrics, q: LngLat): number => {
  let bi = 0;
  let bd = 1e9;
  path.forEach((pt, j) => {
    const d = Math.hypot(pt[0] - q[0], pt[1] - q[1]);
    if (d < bd) {
      bd = d;
      bi = j;
    }
  });
  return metrics.total ? metrics.cum[bi] / metrics.total : 0;
};

const metricsCache = new WeakMap<LngLat[], IRouteMetrics>();
const metricsOf = (path: LngLat[]): IRouteMetrics => {
  let m = metricsCache.get(path);
  if (!m) {
    m = routeMetrics(path);
    metricsCache.set(path, m);
  }
  return m;
};

const segCache = new WeakMap<object, ITrackSegment[]>();
export const segmentsOf = (trip: ISegmentSource): ITrackSegment[] => {
  let s = segCache.get(trip.segments);
  if (!s) {
    s = trip.segments.map((x) => ({
      state: x.state,
      from: toMs(x.from),
      to: x.to ? toMs(x.to) : Infinity
    }));
    segCache.set(trip.segments, s);
  }
  return s;
};

export const departureOf = (trip: { transferRequest: { startDate: string } | null }): number =>
  trip.transferRequest ? toMs(trip.transferRequest.startDate) : NaN;

export const durationHours = (trip: IVehicleTowerTrip): number => {
  if (!trip.stops.length) return NaN;
  return (toMs(trip.stops[trip.stops.length - 1].plannedAt) - departureOf(trip)) / HR;
};

export function segAt(trip: ISegmentSource, t: number): ITrackSegment {
  const segs = segmentsOf(trip);
  let s = segs[0];
  for (const x of segs) {
    if (t >= x.from) s = x;
  }
  return s;
}

export function stateAt(
  trip: ISegmentSource & { transferRequest: unknown },
  t: number
): TowerScreenState {
  const segs = segmentsOf(trip);
  if (!segs.length) return "Sin servicio";
  return t < segs[0].from
    ? trip.transferRequest
      ? "Asignado"
      : "Sin servicio"
    : segAt(trip, t).state;
}

const lastIndexAt = (positions: Array<[number, number, number]>, t: number): number => {
  let lo = 0;
  let hi = positions.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (positions[mid][0] <= t) {
      found = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return found;
};

export function pingMs(trip: IVehicleTowerTrip, t: number): number {
  const p = trip.positions;
  if (p?.length) {
    const i = lastIndexAt(p, t);
    return i >= 0 ? p[i][0] : NaN;
  }
  return trip.lastPing ? toMs(trip.lastPing.date) : NaN;
}

export function positionAt(trip: IVehicleTowerTrip, t: number): LngLat | null {
  const p = trip.positions;
  if (p?.length) {
    const i = lastIndexAt(p, t);
    if (i < 0) return [p[0][1], p[0][2]];
    const a = p[i];
    const b = p[i + 1];
    if (!b) return [a[1], a[2]];
    const g = (t - a[0]) / (b[0] - a[0] || 1);
    return [a[1] + (b[1] - a[1]) * g, a[2] + (b[2] - a[2]) * g];
  }
  return trip.lastPing ? [trip.lastPing.lng, trip.lastPing.lat] : null;
}

export function routeFraction(trip: IVehicleTowerTrip, t: number): number {
  const q = positionAt(trip, t);
  const path = trip.routeGeometry;
  if (!q || path.length < 2) return 0;
  return nearestFrac(path, metricsOf(path), q);
}

const reachedAt = (at: string | null, t: number): number | null => {
  if (!at) return null;
  const ms = toMs(at);
  return ms <= t ? ms : null;
};

export const stopTimes = (
  stop: IVehicleTowerStop,
  t: number
): { arrival: number | null; departure: number | null } => ({
  arrival: reachedAt(stop.arrivedAt, t),
  departure: reachedAt(stop.departedAt, t)
});

export function stopStatus(stop: IVehicleTowerStop, t: number): StopStatus {
  const { arrival, departure } = stopTimes(stop, t);
  return departure !== null ? "done" : arrival !== null ? "here" : "pend";
}

export function stopAt(trip: IVehicleTowerTrip, at: number): number {
  let k = 0;
  trip.stops.forEach((s, i) => {
    const { arrival, departure } = stopTimes(s, at);
    if (arrival !== null || departure !== null) k = i;
  });
  return k;
}

export function currentStop(trip: IVehicleTowerTrip, t: number): number {
  let k = -1;
  trip.stops.forEach((s, i) => {
    const { arrival, departure } = stopTimes(s, t);
    if (arrival !== null && departure === null) k = i;
  });
  return k;
}

export function atOrigin(trip: IVehicleTowerTrip, t: number, defaultRadiusM: number): boolean {
  const origin = trip.stops[0];
  const p = positionAt(trip, t);
  if (!origin || !p) return false;
  return dist(p, [origin.lng, origin.lat]) * 1000 <= (origin.precisionRadioM ?? defaultRadiusM);
}

function recentTrack(trip: IVehicleTowerTrip, t: number): Array<{ at: number; p: LngLat }> {
  if (trip.positions?.length) return trailPings(trip, t - RECENT_MS, t);
  const pings = trip.lastPing ? [...trip.recentPings, trip.lastPing] : trip.recentPings;
  return pings
    .map((x) => ({ at: toMs(x.date), p: [x.lng, x.lat] as LngLat }))
    .filter((x) => x.at <= t)
    .sort((a, b) => a.at - b.at);
}

/** Desde cuándo las posiciones recientes siguen dentro del radio de la última. */
export function stoppedSince(trip: IVehicleTowerTrip, t: number, radiusM: number): number | null {
  const pts = recentTrack(trip, t);
  if (pts.length < 2) return null;
  const last = pts[pts.length - 1];
  let since = last.at;
  for (let i = pts.length - 2; i >= 0; i--) {
    if (dist(pts[i].p, last.p) * 1000 > radiusM) break;
    since = pts[i].at;
  }
  return since;
}

export const driverName = (trip: IVehicleTowerTrip): string =>
  trip.driver ? `${trip.driver.name} ${trip.driver.lastName}`.trim() : "Sin conductor";

export function gpsAgo(trip: IVehicleTowerTrip, t: number): string {
  const ping = pingMs(trip, t);
  return Number.isFinite(ping) ? ago((t - Math.min(t, ping)) / HR) : "--";
}

export function lastFollow(trip: IVehicleTowerTrip, t: number): number {
  let m = NO_FOLLOW_UP;
  const consider = (at: number) => {
    if (at <= t && at > m) m = at;
  };
  if (trip.lastAppEventAt) consider(toMs(trip.lastAppEventAt));
  if (trip.lastNoveltyAt) consider(toMs(trip.lastNoveltyAt));
  for (const e of trip.appEvents) if (e.fromApp) consider(toMs(e.eventTime));
  if (trip.lastFollowUp?.contacted) consider(toMs(trip.lastFollowUp.createdAt));
  for (const f of trip.followUps) if (f.contacted) consider(toMs(f.createdAt));
  return m;
}

export function trailPings(
  trip: IVehicleTowerTrip,
  from: number,
  to: number
): Array<{ at: number; p: LngLat }> {
  const src = trip.positions?.length
    ? trip.positions.map(([at, lng, lat]) => ({ at, p: [lng, lat] as LngLat }))
    : trip.trail.map((x: IVehicleTowerPing) => ({
        at: toMs(x.date),
        p: [x.lng, x.lat] as LngLat
      }));
  return src.filter((x) => x.at >= from && x.at <= to);
}
