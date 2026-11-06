import type {
  IVehicleTowerDriver,
  IVehicleTowerLogEvent,
  IVehicleTowerPing,
  IVehicleTowerStop,
  IVehicleTowerTransferRequest,
  IVehicleTowerTrip,
  TowerSegmentState
} from "../types/vehicleTower";
import { departureOf, nearestFrac, routeMetrics, segmentsOf } from "../lib/tracking";
import type { LngLat } from "../lib/tracking";
import { HR, offsetToIso, toMs } from "../lib/time";

export interface IMockSegment {
  state: TowerSegmentState;
  atStop: boolean;
  from: string;
  to: string;
  progressFrom: number;
  progressTo: number;
}

type ApiOnly =
  | "vehicleId"
  | "transferRequest"
  | "stops"
  | "segments"
  | "lastPing"
  | "recentPings"
  | "trail"
  | "positions"
  | "lastAppEventAt"
  | "lastNoveltyAt"
  | "driver";

export type IMockTrip = Omit<IVehicleTowerTrip, ApiOnly> & {
  transferRequest: Omit<IVehicleTowerTransferRequest, "internalId"> | null;
  stops: Array<Omit<IVehicleTowerStop, "arrivedAt" | "departedAt">>;
  segments: IMockSegment[];
  lastPing: IVehicleTowerPing;
  driver: Omit<IVehicleTowerDriver, "licenseExpiration">;
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

const routeOf = (trip: IMockTrip) => {
  const path = trip.routeGeometry;
  return { path, metrics: routeMetrics(path) };
};

function along(trip: IMockTrip, f: number): LngLat {
  const { path, metrics } = routeOf(trip);
  if (path.length === 1) return path[0];
  const { cum, total } = metrics;
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

function fracAt(trip: IMockTrip, t: number): number {
  const segs = trip.segments;
  if (!segs.length) return 0;
  if (t < toMs(segs[0].from)) return segs[0].progressFrom;
  let s = segs[0];
  for (const x of segs) if (t >= toMs(x.from)) s = x;
  const from = toMs(s.from);
  const g = Math.max(0, Math.min(1, (t - from) / (toMs(s.to) - from)));
  return s.progressFrom + (s.progressTo - s.progressFrom) * g;
}

export const mockPosAt = (trip: IMockTrip, t: number): LngLat =>
  along(trip, fracAt(trip, Math.min(t, toMs(trip.lastPing.date))));

const AT_STOP: readonly TowerSegmentState[] = ["Cargando", "Descargando", "Stand by"];

export function mockStopTimes(
  trip: IMockTrip,
  t: number
): Array<{ arrivedAt: string | null; departedAt: string | null }> {
  const { path, metrics } = routeOf(trip);
  const fr = trip.stops.map((s) => nearestFrac(path, metrics, [s.lng, s.lat]));
  const nearest = (f: number) => {
    let bi = 0;
    let bd = 9;
    fr.forEach((x, i) => {
      const d = Math.abs(x - f);
      if (d < bd) {
        bd = d;
        bi = i;
      }
    });
    return bi;
  };
  const rows = trip.stops.map(() => ({
    arrivedAt: null as string | null,
    departedAt: null as string | null
  }));
  if (!rows.length) return rows;
  for (const seg of trip.segments) {
    if (toMs(seg.from) > t) continue;
    const r = rows[nearest(seg.progressFrom)];
    if (seg.atStop || AT_STOP.includes(seg.state)) {
      if (r.arrivedAt === null || toMs(seg.from) < toMs(r.arrivedAt)) r.arrivedAt = seg.from;
    }
    if (seg.state === "En ruta" && !seg.atStop && r.departedAt === null) r.departedAt = seg.from;
  }
  return rows;
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
  trip: IMockTrip,
  index: number,
  now: number
): { events: IVehicleTowerLogEvent[]; pendingApproval: number } {
  const i = index;
  const rel = (ms: number) => (ms - now) / HR;
  const iso = (h: number) => offsetToIso(now, h);
  const sal = rel(departureOf(trip));
  const prov = trip.carrier.name;
  const plate = trip.vehicle.plate;
  const driver = `${trip.driver.name} ${trip.driver.lastName}`;
  const analyst = trip.analyst?.name ?? "";
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
  const sbSeg = segmentsOf(trip).find((x) => x.state === "Stand by");
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
