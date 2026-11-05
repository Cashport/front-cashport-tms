import type { IFleetItem, IVehicleTowerParams, IVehicleTowerTrip } from "../types/vehicleTower";
import { ALERTAS, evaluate } from "./rules";

export type FilterCategoryId =
  "vp" | "psl" | "type" | "prov" | "user" | "veh" | "mod" | "orig" | "dest" | "an" | "alerta";

export type TowerFilters = Record<FilterCategoryId, string[]>;

export const emptyFilters = (): TowerFilters => ({
  vp: [],
  psl: [],
  type: [],
  prov: [],
  user: [],
  veh: [],
  mod: [],
  orig: [],
  dest: [],
  an: [],
  alerta: []
});

export const VP_CODES = ["VRC", "VRN", "VAO", "VRO", "VPI"];

export const MODALITIES: Record<string, string> = { rf: "Renta fija", co: "Call out" };

export const modalityOf = (t: IVehicleTowerTrip): "rf" | "co" =>
  t.transferRequest?.fixedRate ? "rf" : "co";

export const pslOf = (t: IVehicleTowerTrip): string | null => (t.transferRequest ? t.psl : null);

const uniq = (a: string[]): string[] =>
  Array.from(new Set(a)).sort((x, y) => String(x).localeCompare(String(y), "es"));

const hasTr = (t: IVehicleTowerTrip) => !!t.transferRequest;
const origin = (t: IVehicleTowerTrip) => (hasTr(t) ? (t.stops[0]?.name ?? null) : null);
const destination = (t: IVehicleTowerTrip) =>
  hasTr(t) ? (t.stops[t.stops.length - 1]?.name ?? null) : null;
const requesterOf = (t: IVehicleTowerTrip) => (hasTr(t) ? (t.requester?.name ?? null) : null);

export interface IFilterCategory {
  id: FilterCategoryId;
  name: string;
  get: ((t: IVehicleTowerTrip) => string | null) | null;
  options: (trips: IVehicleTowerTrip[], scope: string | null) => string[];
  label?: (value: string) => string;
}

const present = (a: Array<string | null>): string[] => a.filter((x): x is string => !!x);

export const FILTER_CATEGORIES: IFilterCategory[] = [
  { id: "vp", name: "Vicepresidencia", get: (t) => t.vp, options: () => VP_CODES },
  {
    id: "psl",
    name: "PSL",
    get: pslOf,
    options: (trips, scope) => (scope ? [scope] : uniq(present(trips.filter(hasTr).map(pslOf))))
  },
  {
    id: "type",
    name: "Tipo de servicio",
    get: (t) => (hasTr(t) ? t.vehicle.serviceType : null),
    options: () => ["Carga", "Izaje", "Personal"]
  },
  {
    id: "prov",
    name: "Proveedor",
    get: (t) => t.carrier.name,
    options: (trips) => Array.from(new Set(trips.map((t) => t.carrier.name)))
  },
  {
    id: "user",
    name: "Usuario",
    get: requesterOf,
    options: (trips, scope) =>
      uniq(present(trips.filter((t) => hasTr(t) && inScope(t, scope)).map(requesterOf)))
  },
  {
    id: "veh",
    name: "Tipo de vehículo",
    get: (t) => t.vehicle.type,
    options: (trips) => uniq(trips.map((t) => t.vehicle.type))
  },
  {
    id: "mod",
    name: "Modalidad de servicio",
    get: (t) => (hasTr(t) ? modalityOf(t) : null),
    options: () => Object.keys(MODALITIES),
    label: (k) => MODALITIES[k]
  },
  {
    id: "orig",
    name: "Origen",
    get: origin,
    options: (trips) => uniq(present(trips.filter(hasTr).map(origin)))
  },
  {
    id: "dest",
    name: "Destino",
    get: destination,
    options: (trips) => uniq(present(trips.filter(hasTr).map(destination)))
  },
  {
    id: "an",
    name: "Analista",
    get: (t) => t.analyst.name,
    options: (trips) => Array.from(new Set(trips.map((t) => t.analyst.name)))
  },
  {
    id: "alerta",
    name: "Alerta",
    get: null,
    options: () => Object.keys(ALERTAS),
    label: (k) => ALERTAS[k as keyof typeof ALERTAS].name
  }
];

export const labelOf = (cat: FilterCategoryId, value: string): string => {
  const c = FILTER_CATEGORIES.find((x) => x.id === cat);
  return c?.label ? c.label(value) : value;
};

/** Visibilidad por perfil: un usuario de PSL solo ve los servicios de su PSL (igual que el resto del TMS). */
export const inScope = (t: IVehicleTowerTrip, scope: string | null): boolean =>
  !scope || pslOf(t) === scope;

export function snapshot(
  trips: IVehicleTowerTrip[],
  t: number,
  params: IVehicleTowerParams,
  scope: string | null
): IFleetItem[] {
  return trips
    .filter((x) => inScope(x, scope))
    .map((trip) => ({ trip, evaluation: evaluate(trip, t, params) }));
}

const tripLabel = (t: IVehicleTowerTrip) => (hasTr(t) ? String(t.tripId) : "");

export function matches(item: IFleetItem, query: string, filters: TowerFilters): boolean {
  const q = query.trim().toLowerCase();
  const v = item.trip;
  for (const c of FILTER_CATEGORIES) {
    const sel = filters[c.id];
    if (!sel.length) continue;
    if (c.id === "alerta") {
      if (!item.evaluation.conditions.some((k) => sel.includes(k.code))) return false;
      continue;
    }
    const val = c.get ? c.get(v) : null;
    if (val === null || !sel.includes(val)) return false;
  }
  if (q) {
    const plate = v.vehicle.plate;
    const haystack = [
      plate,
      plate.replace(" ", ""),
      `${v.driver.name} ${v.driver.lastName}`,
      v.transferRequest?.id ?? "",
      tripLabel(v),
      v.carrier.name,
      requesterOf(v) ?? "",
      hasTr(v) ? (v.psl ?? "") : "",
      v.analyst.name
    ];
    if (!haystack.some((s) => s.toLowerCase().includes(q))) return false;
  }
  return true;
}
