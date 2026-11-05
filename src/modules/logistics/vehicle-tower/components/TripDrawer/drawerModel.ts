import type { MapStatusTone } from "@/theme/mapPalette";
import { departureOf, routeMetrics, simSegments, stopIdx } from "../../lib/sim";
import type { ISimSegment } from "../../lib/sim";
import { dur, HR, MIN, sdt, toMs } from "../../lib/time";
import type {
  AlertLevel,
  IEvaluation,
  IVehicleTowerParams,
  IVehicleTowerTrip,
  TowerSegmentState
} from "../../types/vehicleTower";

export function pillText(e: IEvaluation): string {
  const byTone: Record<MapStatusTone, string> = {
    off: "Sin control",
    crit: "Alerta crítica",
    high: "Alerta alta",
    med: "Alerta media",
    ok: "En servicio",
    idle: e.isScheduled ? "Programado" : "Sin servicio"
  };
  return byTone[e.level];
}

export const stopLabel = (i: number, n: number): string =>
  i === 0 ? "Origen" : i === n - 1 ? "Destino" : `Parada ${i}`;

export type StopStatus = "done" | "here" | "pend";

export interface IStopRow {
  index: number;
  name: string;
  plan: number;
  arrival: number | null;
  departure: number | null;
  status: StopStatus;
}

const AT_STOP: readonly TowerSegmentState[] = ["Cargando", "En parada", "Descargando", "Stand by"];

export function stopInfo(trip: IVehicleTowerTrip, t: number): IStopRow[] {
  const rows = trip.stops.map((s, index) => ({
    index,
    name: s.name,
    plan: toMs(s.plannedAt),
    arrival: null as number | null,
    departure: null as number | null
  }));
  if (!rows.length) return [];
  for (const seg of simSegments(trip)) {
    if (seg.from > t) continue;
    if ((AT_STOP as readonly string[]).includes(seg.state)) {
      const r = rows[stopIdx(trip, seg.progressFrom)];
      if (r.arrival === null || seg.from < r.arrival) r.arrival = seg.from;
    }
    if (seg.state === "En ruta") {
      const r = rows[stopIdx(trip, seg.progressFrom)];
      if (r.departure === null) r.departure = seg.from;
    }
  }
  return rows.map((r) => ({
    ...r,
    status: r.departure !== null && r.departure <= t ? "done" : r.arrival !== null ? "here" : "pend"
  }));
}

const metricsCache = new WeakMap<object, number>();
export function routeTotalKm(trip: IVehicleTowerTrip): number {
  let km = metricsCache.get(trip.routeGeometry);
  if (km === undefined) {
    km = routeMetrics(trip.routeGeometry).total;
    metricsCache.set(trip.routeGeometry, km);
  }
  return km;
}

export const isDepartureOverdue = (
  row: IStopRow,
  t: number,
  params: IVehicleTowerParams
): boolean => row.index === 0 && (t - row.plan) / MIN > params.salidaVencidaMin;

/** El plan de una TR que sigue sin iniciar se corre con el retraso (ETA del destino). */
export const etaOf = (
  row: IStopRow,
  isLast: boolean,
  notStarted: boolean,
  trip: IVehicleTowerTrip,
  t: number
) => (isLast && notStarted ? row.plan + Math.max(0, t - departureOf(trip)) : row.plan);

export const STATE_KEY: Record<string, string> = {
  "En parada": "par",
  "Sin iniciar": "sin",
  Cargando: "carg",
  "En ruta": "ruta",
  Descargando: "desc",
  "Stand by": "sb",
  Detenido: "det",
  "Sin servicio": "sin",
  Asignado: "sin"
};

export interface ITimelineRow {
  kind: "state" | "alert" | "marker";
  at: number;
  name: string;
  date: string;
  detail?: string;
  stateKey?: string;
  tone?: AlertLevel;
}

export interface ITimelineHead {
  tone: MapStatusTone;
  name: string;
  date: string;
  detail?: string;
}

export interface ITimeline {
  scheduled: boolean;
  head: ITimelineHead;
  rows: ITimelineRow[];
}

export function buildTimeline(
  trip: IVehicleTowerTrip,
  e: IEvaluation,
  t: number,
  params: IVehicleTowerParams
): ITimeline {
  const sal = departureOf(trip);
  const segs = simSegments(trip).filter((x) => x.from <= t);
  if (!segs.length || e.isScheduled) {
    return {
      scheduled: true,
      head: { tone: "idle", name: "Programado", date: `sale ${sdt(sal)}` },
      rows: []
    };
  }
  const cur = segs[segs.length - 1];
  const top = e.top;
  const stateName = (x: ISimSegment): string => {
    const n = trip.stops.length;
    if (x.state === "En parada") {
      const k = stopIdx(trip, x.progressFrom);
      return k === n - 1
        ? `En destino · ${trip.stops[k]?.name}`
        : `Parada ${k} · ${trip.stops[k]?.name}`;
    }
    if (x.state === "En ruta" && n > 2) {
      const k = Math.min(n - 1, stopIdx(trip, x.progressFrom) + 1);
      return `En ruta → ${trip.stops[k]?.name}`;
    }
    return x.state;
  };
  const stateRow = (x: ISimSegment, until: number): ITimelineRow => ({
    kind: "state",
    at: x.from + 1e-6,
    name: stateName(x),
    date: `${sdt(x.from)} · ${dur((until - x.from) / HR)}`,
    stateKey: STATE_KEY[x.state] ?? "sin"
  });
  const rows: ITimelineRow[] = [];
  segs.slice(0, -1).forEach((x, i) => rows.push(stateRow(x, segs[i + 1].from)));
  if (top && top.code !== "SB") rows.push(stateRow(cur, top.code === "GPS" ? top.since : t));
  const alert = (tone: AlertLevel, name: string, at: number, detail: string) => {
    if (at <= t) rows.push({ kind: "alert", at, name, date: sdt(at), detail, tone });
  };
  e.conditions.slice(1).forEach((c) => alert(c.lvl, c.name, c.since, c.detail));
  segs.slice(0, -1).forEach((x, i) => {
    if (x.state !== "Detenido") return;
    const d = segs[i + 1].from - x.from;
    if (d / MIN > params.detenidoMin)
      alert(
        "high",
        "Detenido en vía",
        x.from + params.detenidoMin * MIN,
        `Resuelta: reanudó tras ${dur(d / HR)} detenido`
      );
  });
  rows.push({ kind: "marker", at: sal, name: "Salida programada", date: sdt(sal) });
  const all = simSegments(trip);
  const ini = all.find((x) => x.state === "Cargando" || x.state === "En ruta");
  const out = all.find((x) => x.state === "En ruta");
  const overdue = sal + params.salidaVencidaMin * MIN;
  if (ini && ini.from <= t && ini.from > overdue && !e.conditions.some((c) => c.code === "APP"))
    alert(
      "off",
      "Sin iniciar en app",
      overdue,
      `Resuelta: inició el cargue ${dur((ini.from - sal) / HR)} tarde`
    );
  if (out && out.from <= t && out.from > overdue && ini && ini.state === "Cargando")
    alert("med", "Salida demorada", overdue, `Resuelta: salió ${dur((out.from - sal) / HR)} tarde`);
  rows.sort((a, b) => b.at - a.at);
  const head: ITimelineHead = top
    ? {
        tone: top.lvl,
        name: top.name,
        date: `${sdt(top.since)} · ${dur((t - top.since) / HR)}`,
        detail: top.detail
      }
    : {
        tone: e.level,
        name: stateName(cur),
        date: `${sdt(cur.from)} · ${dur((t - cur.from) / HR)}`
      };
  return { scheduled: false, head, rows };
}
