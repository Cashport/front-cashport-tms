import type { Feature, FeatureCollection, LineString, Point } from "geojson";
import type { MapStatusTone } from "@/theme/mapPalette";
import { fracAt, along, markerPos, pingMs, posAt, simSegments, stopIdx } from "../../lib/sim";
import { HR } from "../../lib/time";
import type { IFleetItem, IVehicleTowerTrip } from "../../types/vehicleTower";

export type LngLat = [number, number];
export type LngLatBounds = [LngLat, LngLat];

export type StopStatus = "done" | "here" | "pend";
export type StopRole = "org" | "dst" | "mid";

export interface IVehicleProps {
  tripId: number;
  tone: MapStatusTone;
  selected: 0 | 1;
  dim: 0 | 1;
  order: number;
}

export interface ISelectionLineProps {
  kind: "plan" | "trail" | "gap";
}

export interface ISelectionPointProps {
  kind: "ping" | "stop";
  role?: StopRole;
  status?: StopStatus;
  mark?: string;
  label?: string;
}

export type VehicleCollection = FeatureCollection<Point, IVehicleProps>;
export type SelectionLines = FeatureCollection<LineString, ISelectionLineProps>;
export type SelectionPoints = FeatureCollection<Point, ISelectionPointProps>;

export const emptyCollection = <G extends Point | LineString, P>(): FeatureCollection<G, P> => ({
  type: "FeatureCollection",
  features: []
});

const BUCKET_DRAW: Record<string, number> = { alert: 0, off: 1, ok: 2, idle: 3 };
const PING_STEP_MS = HR / 6;
const PING_EVERY = 6;
const TRAIL_WINDOW_MS = 24 * HR;
const GAP_MIN_MS = 0.5 * HR;

const isCoord = (p: LngLat): boolean =>
  Number.isFinite(p[0]) && Number.isFinite(p[1]) && Math.abs(p[0]) <= 180 && Math.abs(p[1]) <= 90;

const vehiclePos = (trip: IVehicleTowerTrip, t: number): LngLat => markerPos(trip, t);

export const driverName = (trip: IVehicleTowerTrip): string =>
  `${trip.driver.name} ${trip.driver.lastName}`.trim();

export function vehiclesToGeoJson(
  fleet: IFleetItem[],
  t: number,
  selectedTripId: number | null
): VehicleCollection {
  const features: Feature<Point, IVehicleProps>[] = [];
  for (const item of fleet) {
    const p = vehiclePos(item.trip, t);
    if (!isCoord(p)) continue;
    const selected = item.trip.tripId === selectedTripId;
    features.push({
      type: "Feature",
      id: item.trip.tripId,
      geometry: { type: "Point", coordinates: p },
      properties: {
        tripId: item.trip.tripId,
        tone: item.evaluation.level,
        selected: selected ? 1 : 0,
        dim: selectedTripId !== null && !selected ? 1 : 0,
        order: selected ? -1 : BUCKET_DRAW[item.evaluation.bucket]
      }
    });
  }
  // Mapbox dibuja en el orden de los features: el último queda arriba (sort del prototipo).
  features.sort((a, b) => b.properties.order - a.properties.order);
  return { type: "FeatureCollection", features };
}

export function stopStatuses(trip: IVehicleTowerTrip, t: number): StopStatus[] {
  const n = trip.stops.length;
  const arr: Array<number | null> = Array(n).fill(null);
  const dep: Array<number | null> = Array(n).fill(null);
  for (const x of simSegments(trip)) {
    if (x.from > t) continue;
    if (["Cargando", "En parada", "Descargando", "Stand by"].includes(x.state)) {
      const i = stopIdx(trip, x.progressFrom);
      if (arr[i] === null || x.from < (arr[i] as number)) arr[i] = x.from;
    }
    if (x.state === "En ruta") {
      const i = stopIdx(trip, x.progressFrom);
      if (dep[i] === null) dep[i] = x.from;
    }
  }
  return trip.stops.map((_, i) => {
    const d = dep[i];
    if (d !== null && d <= t) return "done";
    return arr[i] !== null ? "here" : "pend";
  });
}

const stopLabel = (i: number, n: number): string =>
  i === 0 ? "Origen" : i === n - 1 ? "Destino" : `Parada ${i}`;

/** La estela arranca 24 h antes de `anchor` (hora real), no de `t`: en el histórico crece hasta el deslizador. */
export function trailPoints(trip: IVehicleTowerTrip, t: number, anchor: number = t): LngLat[] {
  const segs = simSegments(trip);
  if (!segs.length) return [];
  const t1 = Math.min(t, pingMs(trip));
  const start = Math.max(anchor - TRAIL_WINDOW_MS, segs[0].from);
  const pts: LngLat[] = [];
  for (let k = start; k <= t1 + 1; k += PING_STEP_MS) pts.push(posAt(trip, k));
  pts.push(posAt(trip, t1));
  return pts;
}

export function selectionToGeoJson(
  item: IFleetItem | undefined,
  t: number,
  anchor: number = t
): { lines: SelectionLines; points: SelectionPoints } {
  const lines = emptyCollection<LineString, ISelectionLineProps>();
  const points = emptyCollection<Point, ISelectionPointProps>();
  if (!item || !item.trip.transferRequest) return { lines, points };
  const trip = item.trip;

  const line = (kind: ISelectionLineProps["kind"], coordinates: LngLat[]) => {
    const valid = coordinates.filter(isCoord);
    if (valid.length > 1) {
      lines.features.push({
        type: "Feature",
        geometry: { type: "LineString", coordinates: valid },
        properties: { kind }
      });
    }
  };

  line("plan", trip.routeGeometry);
  const pts = trailPoints(trip, t, anchor);
  line("trail", pts);
  pts.forEach((p, i) => {
    if (i % PING_EVERY === 0 && isCoord(p)) {
      points.features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: p },
        properties: { kind: "ping" }
      });
    }
  });
  if (t > pingMs(trip) + GAP_MIN_MS) {
    line("gap", [posAt(trip, pingMs(trip)), along(trip, fracAt(trip, t))]);
  }

  const status = stopStatuses(trip, t);
  const n = trip.stops.length;
  trip.stops.forEach((s, i) => {
    const c: LngLat = [s.lng, s.lat];
    if (!isCoord(c)) return;
    points.features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: c },
      properties: {
        kind: "stop",
        role: i === 0 ? "org" : i === n - 1 ? "dst" : "mid",
        status: status[i],
        mark: i === 0 ? "O" : i === n - 1 ? "D" : String(i),
        label: `${stopLabel(i, n)} · ${s.name}`
      }
    });
  });
  return { lines, points };
}

const boundsOf = (pts: LngLat[]): LngLatBounds | null => {
  const valid = pts.filter(isCoord);
  if (!valid.length) return null;
  let w = Infinity;
  let s = Infinity;
  let e = -Infinity;
  let n = -Infinity;
  for (const [x, y] of valid) {
    w = Math.min(w, x);
    e = Math.max(e, x);
    s = Math.min(s, y);
    n = Math.max(n, y);
  }
  return [
    [w, s],
    [e, n]
  ];
};

export const fleetBounds = (fleet: IFleetItem[], t: number): LngLatBounds | null =>
  boundsOf(fleet.map((x) => vehiclePos(x.trip, t)));

export const tripBounds = (trip: IVehicleTowerTrip, t: number): LngLatBounds | null =>
  boundsOf([...trip.routeGeometry, vehiclePos(trip, t)]);

export function tooltipOf(item: IFleetItem): { title: string; why: string; tr: string | null } {
  const { trip, evaluation } = item;
  return {
    title: `${trip.vehicle.plate} · ${driverName(trip)}`,
    why: evaluation.top ? evaluation.top.name : evaluation.state,
    tr: trip.transferRequest ? trip.transferRequest.id : null
  };
}
