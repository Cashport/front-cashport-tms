import type { MapStatusTone } from "@/theme/mapPalette";
import type {
  AlertCode,
  FleetBucket,
  IAlertCondition,
  IAlertDefinition,
  IEvaluation,
  IFleetItem,
  IVehicleTowerParams,
  IVehicleTowerTrip,
  TowerScreenState,
  TowerSegmentState
} from "../types/vehicleTower";
import {
  atOrigin,
  currentStop,
  departureOf,
  durationHours,
  lastFollow,
  pingMs,
  segAt,
  stateAt,
  stopTimes,
  stoppedSince
} from "./tracking";
import { dt, dur, HR, hhmm, MIN } from "./time";

export const EN_CURSO: readonly TowerSegmentState[] = [
  "Cargando",
  "En ruta",
  "Descargando",
  "Stand by",
  "Detenido"
];

export const ALERTAS: Record<AlertCode, IAlertDefinition> = {
  SB: {
    lvl: "crit",
    pri: 8,
    name: "Stand by",
    fase: "Destino",
    rule: "La TR está en Stand by en el TMS. Se muestran las horas que lleva en ese estado."
  },
  RSB: {
    lvl: "high",
    pri: 7,
    name: "Riesgo de stand by",
    fase: "Origen, paradas o destino",
    rule: "Origen: pasaron 4 h desde la salida programada y el vehículo sigue dentro de 50 m del origen (con o sin app iniciada). Parada intermedia: lleva 4 h dentro de 50 m de la parada sin salir. Destino: lleva 4 h en el destino sin finalizar el descargue. No aplica a vehículos de renta fija en sitio."
  },
  APP: {
    lvl: "off",
    pri: 6,
    name: "Sin iniciar en app",
    fase: "Origen",
    rule: "Pasaron 30 min de la salida programada y el conductor no ha iniciado el servicio en la app (no hay cargue ni salida)."
  },
  DET: {
    lvl: "high",
    pri: 5,
    name: "Detenido en vía",
    fase: "Ruta",
    rule: "En ruta, el GPS lo reporta dentro de un radio de 30 m por más de 25 min."
  },
  GPS: {
    lvl: "off",
    pri: 4,
    name: "Sin señal GPS",
    fase: "Ruta",
    rule: "Servicio en curso sin reporte de posición por más de 30 min."
  },
  DEM: {
    lvl: "med",
    pri: 3,
    name: "Salida demorada",
    fase: "Origen",
    rule: "El conductor inició el cargue en la app, pero 30 min después de la salida programada el GPS lo sigue ubicando dentro de 50 m del punto de origen."
  },
  SEG: {
    lvl: "high",
    pri: 2,
    name: "Sin seguimiento",
    fase: "Ruta",
    rule: "En curso sin evento de la app, novedad ni comentario por más de 4 h (viaje ≤ 1 día) o 6 h (viaje > 1 día)."
  },
  CIE: {
    lvl: "med",
    pri: 1,
    name: "Descargue sin cierre",
    fase: "Destino",
    rule: "El vehículo llegó y está descargando hace más de 2 h, pero la TR no ha pasado a Por legalizar."
  }
};

export const SEV: Record<string, number> = { crit: 3, high: 2, med: 1 };
export const SEV2: Record<string, number> = { crit: 4, high: 3, off: 2, med: 1 };

export const BUCKET_ORDER: Record<FleetBucket, number> = { alert: 0, off: 1, ok: 2, idle: 3 };

export const BUCKET_LABELS: Record<Exclude<FleetBucket, "idle">, [string, string, string]> = {
  ok: ["En servicio", "Activos", "En curso sin alertas"],
  alert: ["Con alerta", "Con alerta", "Riesgo, stand by o demoras"],
  off: ["Sin control", "Sin control", "Sin app iniciada o sin GPS"]
};

export const FOLLOW_UP_OUTCOMES: ReadonlyArray<readonly [string, boolean]> = [
  ["Contestó · sin novedad", true],
  ["Contestó · reporta novedad", true],
  ["Contestó · nueva hora de salida", true],
  ["Contacto con el proveedor", true],
  ["No contestó", false],
  ["Buzón de voz", false],
  ["Número errado", false]
];

export const TMS_STATES = [
  "Sin iniciar",
  "Cargando",
  "En curso",
  "Descargando",
  "Detenido",
  "Stand by"
] as const;

export const toTMS = (st: TowerScreenState): string =>
  (
    ({
      "En ruta": "En curso",
      Programado: "Sin iniciar",
      Asignado: "Sin iniciar"
    }) as Record<string, string>
  )[st] || st;

export function evaluate(
  trip: IVehicleTowerTrip,
  t: number,
  params: IVehicleTowerParams
): IEvaluation {
  const st = stateAt(trip, t);
  if (!trip.transferRequest || st === "Sin servicio") {
    return { state: st, bucket: "idle", level: "idle", conditions: [], top: null };
  }
  const sal = departureOf(trip);
  if (st === "Asignado" || (st === "Sin iniciar" && (t - sal) / MIN <= params.salidaVencidaMin)) {
    return {
      state: "Programado",
      bucket: "idle",
      level: "idle",
      isScheduled: true,
      conditions: [],
      top: null
    };
  }
  const C: IAlertCondition[] = [];
  const sg = segAt(trip, t);
  const enCurso = (EN_CURSO as readonly string[]).includes(st);
  const sinSalir = st === "Sin iniciar" || st === "Cargando";
  const add = (code: AlertCode, since: number, short: string, detail: string) =>
    C.push({ code, ...ALERTAS[code], since, short, detail });
  const lim = durationHours(trip) <= 24 ? params.segCorto : params.segLargo;
  const lf = lastFollow(trip, t);
  const ping = pingMs(trip, t);
  const sinceSal = (t - sal) / HR;
  const inState = (t - sg.from) / HR;

  if (st === "Stand by") {
    add(
      "SB",
      sg.from,
      `Stand by · ${dur(inState)}`,
      `${dur(inState)} en stand by desde ${hhmm(sg.from)}`
    );
  }
  const fixedRate = trip.transferRequest.fixedRate;
  const inOrigin = atOrigin(trip, t, params.radioOrigenM);
  if (sinSalir && !fixedRate && inOrigin && sinceSal > params.riesgoSBh) {
    add(
      "RSB",
      sal + params.riesgoSBh * HR,
      `Riesgo stand by · ${dur(sinceSal)}`,
      `En origen (radio ${params.radioOrigenM} m) ${dur(sinceSal)} después de la salida programada`
    );
  }
  const stop = currentStop(trip, t);
  if (st === "En ruta" && !fixedRate && stop > 0) {
    const arrival = stopTimes(trip.stops[stop], t).arrival as number;
    const inStop = (t - arrival) / HR;
    const name = trip.stops[stop].name;
    if (inStop > params.riesgoSBh) {
      add(
        "RSB",
        arrival + params.riesgoSBh * HR,
        `Riesgo stand by · ${dur(inStop)}`,
        stop === trip.stops.length - 1
          ? `En destino (${name}) hace ${dur(inStop)} y la TR sigue En curso`
          : `En parada ${stop} (${name}) hace ${dur(inStop)} sin salir`
      );
    }
  }
  if (st === "Descargando" && !fixedRate && inState > params.riesgoSBh) {
    add(
      "RSB",
      sg.from + params.riesgoSBh * HR,
      `Riesgo stand by · ${dur(inState)}`,
      `En destino hace ${dur(inState)} sin finalizar el descargue`
    );
  }
  const signalAt = Number.isFinite(ping) ? Math.min(t, ping) : sg.from;
  const noSignal = (t - signalAt) / MIN > params.sinSenalMin;
  const stoppedAt =
    st === "Detenido"
      ? sg.from
      : st === "En ruta" && stop < 0 && !noSignal
        ? stoppedSince(trip, t, params.radioDetenidoM)
        : null;
  if (stoppedAt !== null && (t - stoppedAt) / MIN > params.detenidoMin) {
    const stopped = (t - stoppedAt) / HR;
    add(
      "DET",
      stoppedAt + params.detenidoMin * MIN,
      `Detenido · ${dur(stopped)}`,
      `Dentro de ${params.radioDetenidoM} m hace ${dur(stopped)}`
    );
  }
  if (enCurso && st !== "Cargando" && noSignal) {
    add(
      "GPS",
      signalAt,
      `Sin señal · ${dur((t - signalAt) / HR)}`,
      Number.isFinite(ping) ? `Último punto recibido el ${dt(ping)}` : "Sin posiciones reportadas"
    );
  }
  if (st === "Sin iniciar" && (t - sal) / MIN > params.salidaVencidaMin) {
    add(
      "APP",
      sal + params.salidaVencidaMin * MIN,
      `Sin iniciar · ${dur(sinceSal)}`,
      `Debía salir el ${dt(sal)} y no ha iniciado en la app`
    );
  }
  if (st === "Cargando" && inOrigin && (t - sal) / MIN > params.salidaVencidaMin) {
    add(
      "DEM",
      sal + params.salidaVencidaMin * MIN,
      `Salida demorada · ${dur(sinceSal)}`,
      `Sigue a menos de ${params.radioOrigenM} m del origen; debía salir ${hhmm(sal)}`
    );
  }
  if (enCurso && st !== "Cargando" && (t - lf) / HR > lim) {
    add(
      "SEG",
      lf + lim * HR,
      `Sin seguimiento · ${dur((t - lf) / HR)}`,
      `${dur((t - lf) / HR)} sin seguimiento (límite ${lim} h)`
    );
  }
  if (st === "Descargando" && inState > params.cierreH) {
    add(
      "CIE",
      sg.from + params.cierreH * HR,
      `Sin cierre · ${dur(inState)}`,
      `Descargando hace ${dur(inState)} y la TR no pasa a Por legalizar`
    );
  }
  C.sort((a, b) => b.pri - a.pri || b.since - a.since);
  const top = C[0] || null;
  const level: MapStatusTone = top ? top.lvl : "ok";
  const bucket: FleetBucket = !top ? "ok" : level === "off" ? "off" : "alert";
  return { state: st, bucket, level, conditions: C, top };
}

export function sortKey(item: IFleetItem, t: number): number {
  const e = item.evaluation;
  let k = BUCKET_ORDER[e.bucket] * 1e6;
  if (e.top) k -= e.top.pri * 1e4 + ((t - e.top.since) / HR) * 10;
  return k;
}

export const sortFleet = (items: IFleetItem[], t: number): IFleetItem[] =>
  items.slice().sort((a, b) => sortKey(a, t) - sortKey(b, t));

export const toneOf = (e: IEvaluation): MapStatusTone => e.level;

export const TONES: readonly MapStatusTone[] = ["ok", "med", "high", "crit", "off", "idle"];

export function groupByTone(items: IFleetItem[]): Record<MapStatusTone, IFleetItem[]> {
  const out: Record<MapStatusTone, IFleetItem[]> = {
    ok: [],
    med: [],
    high: [],
    crit: [],
    off: [],
    idle: []
  };
  items.forEach((x) => out[toneOf(x.evaluation)].push(x));
  return out;
}

export function countByBucket(items: IFleetItem[]): Record<FleetBucket, number> {
  const cnt: Record<FleetBucket, number> = { ok: 0, alert: 0, off: 0, idle: 0 };
  items.forEach((x) => cnt[x.evaluation.bucket]++);
  return cnt;
}
