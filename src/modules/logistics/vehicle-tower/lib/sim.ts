import type {
  IVehicleTowerLogEvent,
  IVehicleTowerTrip,
  TowerScreenState,
  TowerSegmentState
} from "../types/vehicleTower";
import { HR, offsetToIso, toMs } from "./time";

type LngLat = [number, number];

export interface ISimSegment {
  state: TowerSegmentState;
  from: number;
  to: number;
  progressFrom: number;
  progressTo: number;
}

export const NO_FOLLOW_UP = -1e9 * HR;

export const dist = (a: LngLat, b: LngLat): number => {
  const R = 6371;
  const r = Math.PI / 180;
  const dl = (b[1] - a[1]) * r;
  const dn = (b[0] - a[0]) * r;
  const x = Math.sin(dl / 2) ** 2 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.sin(dn / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

export function curvy(pts: LngLat[]): LngLat[] {
  const out: LngLat[] = [];
  let seed = pts.length * 7 + Math.round(pts[0][0] * 100);
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280 - 0.5;
  };
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L;
    const ny = dx / L;
    const bend = (((i * 37) % 7) - 3) * 0.022 * L;
    const n = Math.max(10, Math.round(L * 28));
    out.push(a);
    for (let k = 1; k < n; k++) {
      const f = k / n;
      const off =
        bend * Math.sin(f * Math.PI) +
        0.012 * L * Math.sin(f * Math.PI * 5 + i) +
        rnd() * 0.006 * L * (1 - Math.abs(2 * f - 1));
      out.push([a[0] + dx * f + nx * off, a[1] + dy * f + ny * off]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

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
const metricsOf = (trip: IVehicleTowerTrip): IRouteMetrics => {
  let m = metricsCache.get(trip.routeGeometry);
  if (!m) {
    m = routeMetrics(trip.routeGeometry);
    metricsCache.set(trip.routeGeometry, m);
  }
  return m;
};

const stopFCache = new WeakMap<object, number[]>();
export const stopFractions = (trip: IVehicleTowerTrip): number[] => {
  let f = stopFCache.get(trip.stops);
  if (!f) {
    const m = metricsOf(trip);
    f = trip.stops.map((s) => nearestFrac(trip.routeGeometry, m, [s.lng, s.lat]));
    stopFCache.set(trip.stops, f);
  }
  return f;
};

const segCache = new WeakMap<object, ISimSegment[]>();
export const simSegments = (trip: IVehicleTowerTrip): ISimSegment[] => {
  let s = segCache.get(trip.segments);
  if (!s) {
    s = trip.segments.map((x) => ({
      state: x.state,
      from: toMs(x.from),
      to: toMs(x.to),
      progressFrom: x.progressFrom,
      progressTo: x.progressTo
    }));
    segCache.set(trip.segments, s);
  }
  return s;
};
export const departureOf = (trip: IVehicleTowerTrip): number =>
  trip.transferRequest ? toMs(trip.transferRequest.startDate) : NaN;

export const durationHours = (trip: IVehicleTowerTrip): number => {
  if (!trip.stops.length) return NaN;
  return (toMs(trip.stops[trip.stops.length - 1].plannedAt) - departureOf(trip)) / HR;
};

export const pingMs = (trip: IVehicleTowerTrip): number => toMs(trip.lastPing.date);

export function segAt(trip: IVehicleTowerTrip, t: number): ISimSegment {
  const segs = simSegments(trip);
  let s = segs[0];
  for (const x of segs) {
    if (t >= x.from) s = x;
  }
  return s;
}

export function stateAt(trip: IVehicleTowerTrip, t: number): TowerScreenState {
  const segs = simSegments(trip);
  if (!segs.length) return "Sin servicio";
  return t < segs[0].from
    ? trip.transferRequest
      ? "Asignado"
      : "Sin servicio"
    : segAt(trip, t).state;
}

export function along(trip: IVehicleTowerTrip, f: number): LngLat {
  const path = trip.routeGeometry;
  if (path.length === 1) return path[0];
  const { cum, total } = metricsOf(trip);
  const d = f * total;
  for (let j = 1; j < cum.length; j++) {
    if (d <= cum[j]) {
      const g = (d - cum[j - 1]) / (cum[j] - cum[j - 1] || 1);
      const a = path[j - 1];
      const b = path[j];
      return [a[0] + (b[0] - a[0]) * g, a[1] + (b[1] - a[1]) * g];
    }
  }
  return path[path.length - 1];
}

export function fracAt(trip: IVehicleTowerTrip, t: number): number {
  const segs = simSegments(trip);
  if (!segs.length) return 0;
  if (t < segs[0].from) return segs[0].progressFrom;
  const s = segAt(trip, t);
  const g = Math.max(0, Math.min(1, (t - s.from) / (s.to - s.from)));
  return s.progressFrom + (s.progressTo - s.progressFrom) * g;
}

export function posAt(trip: IVehicleTowerTrip, t: number): LngLat {
  return along(trip, fracAt(trip, Math.min(t, pingMs(trip))));
}

export function markerPos(trip: IVehicleTowerTrip, t: number, jitter?: LngLat): LngLat {
  const q = posAt(trip, t);
  if (!jitter) return q;
  const f = fracAt(trip, Math.min(t, pingMs(trip)));
  const w = f < 0.03 || f > 0.97 ? 1 : 0;
  return [q[0] + jitter[0] * w, q[1] + jitter[1] * w];
}

export function stopIdx(trip: IVehicleTowerTrip, f: number): number {
  let bi = 0;
  let bd = 9;
  stopFractions(trip).forEach((x, i) => {
    const d = Math.abs(x - f);
    if (d < bd) {
      bd = d;
      bi = i;
    }
  });
  return bi;
}

export function simSpeed(
  trip: IVehicleTowerTrip,
  state: TowerScreenState,
  hasGpsAlert: boolean
): number {
  return state === "En ruta" && !hasGpsAlert ? 42 + ((trip.tripId * 7) % 28) : 0;
}

export function lastFollow(trip: IVehicleTowerTrip, t: number): number {
  let m = NO_FOLLOW_UP;
  const consider = (at: number) => {
    if (at <= t && at > m) m = at;
  };
  for (const e of trip.appEvents) if (e.fromApp) consider(toMs(e.eventTime));
  const seen = trip.followUps.length
    ? trip.followUps
    : trip.lastFollowUp
      ? [trip.lastFollowUp]
      : [];
  for (const f of seen) if (f.contacted) consider(toMs(f.createdAt));
  return m;
}

const INVITED = [1, 2, 3, 3, 4, 5];
const OLD_DRIVERS = [
  "Wilson Ardila",
  "Jairo Peña",
  "Óscar Leal",
  "Fabián Rincón",
  "Henry Guzmán",
  "Elkin Pardo"
];
const STAND_BY_DAY_COST = 1450000;

export function simEvents(
  trip: IVehicleTowerTrip,
  index: number,
  now: number
): { events: IVehicleTowerLogEvent[]; pendingApproval: number } {
  const i = index;
  const rel = (ms: number) => (ms - now) / HR;
  const iso = (h: number) => offsetToIso(now, h);
  const sal = rel(departureOf(trip));
  const analyst = trip.analyst.name;
  const prov = trip.carrier.name;
  const plate = trip.vehicle.plate;
  const driver = `${trip.driver.name} ${trip.driver.lastName}`;
  const costo = trip.cost?.amount ?? 0;
  const inv = INVITED[i % INVITED.length];
  const out: IVehicleTowerLogEvent[] = [];
  let pend = 0;
  const tA = sal - 26 - (i % 5);
  const tV = sal - 18 + (i % 4);
  out.push({
    at: iso(tA),
    kind: "assignment",
    tag: "Asignación",
    text: `Servicio asignado a ${prov}${inv > 1 ? ` · ${inv} proveedores invitados` : ""}`,
    who: analyst,
    role: "Analista",
    amount: costo
  });
  const oldc = OLD_DRIVERS[i % OLD_DRIVERS.length];
  if (i % 13 === 5) {
    const L = "BCDFGHJKLMNPRSTVWXYZ";
    const op = L[i % 20] + L[(i * 3) % 20] + L[(i * 7) % 20] + " " + (100 + ((i * 37) % 900));
    out.push({
      at: iso(tV),
      kind: "assignment",
      tag: "Asignación",
      text: `Asigna vehículo ${op} y conductor ${oldc}`,
      who: prov,
      role: "Proveedor"
    });
    out.push({
      at: iso(Math.min(sal - 1.5, tV + 5)),
      kind: "resourceChange",
      tag: "Cambio de vehículo",
      text: `${op} → ${plate} · conductor ${oldc} → ${driver}`,
      who: prov,
      role: "Proveedor"
    });
  } else if (i % 11 === 3) {
    out.push({
      at: iso(tV),
      kind: "assignment",
      tag: "Asignación",
      text: `Asigna vehículo ${plate} y conductor ${oldc}`,
      who: prov,
      role: "Proveedor"
    });
    out.push({
      at: iso(Math.min(sal - 1, tV + 4)),
      kind: "resourceChange",
      tag: "Cambio de conductor",
      text: `${oldc} → ${driver}`,
      who: prov,
      role: "Proveedor"
    });
  } else {
    out.push({
      at: iso(tV),
      kind: "assignment",
      tag: "Asignación",
      text: `Asigna vehículo ${plate} y conductor ${driver}`,
      who: prov,
      role: "Proveedor"
    });
  }
  const sbSeg = simSegments(trip).find((x) => x.state === "Stand by");
  if (sbSeg) {
    const sbFrom = rel(sbSeg.from);
    const days = Math.max(1, Math.ceil(-sbFrom / 24));
    const amt = days * STAND_BY_DAY_COST;
    const tc = Math.min(-1.2, sbFrom + Math.min(20, -sbFrom * 0.5));
    out.push({
      at: iso(tc),
      kind: "cost",
      text: "Carga sobrecosto de stand by",
      who: prov,
      role: "Proveedor",
      amount: amt,
      approved: false
    });
    if (i % 2 === 0 && days > 1) {
      out.push({
        at: iso(Math.min(-0.1, tc + 1)),
        kind: "cost",
        text: "Aprueba 1 día de stand by; el resto queda en revisión",
        who: analyst,
        role: "Analista",
        amount: STAND_BY_DAY_COST,
        approved: true
      });
      pend += amt - STAND_BY_DAY_COST;
    } else pend += amt;
  }
  if (i % 9 === 4 && !sbSeg) {
    const amt = 380000 + (i % 5) * 120000;
    out.push({
      at: iso(Math.min(-0.4, sal + 1.2)),
      kind: "cost",
      text: "Carga sobrecosto: espera en portería del cliente",
      who: prov,
      role: "Proveedor",
      amount: amt,
      approved: i % 2 === 0
    });
    if (i % 2) pend += amt;
  }
  return { events: out, pendingApproval: pend };
}
