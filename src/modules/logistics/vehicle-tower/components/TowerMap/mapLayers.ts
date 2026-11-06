import type mapboxgl from "mapbox-gl";
import type { MapPaletteTokens, MapStatusTone } from "@/theme/mapPalette";
import {
  emptyCollection,
  type SelectionLines,
  type SelectionPoints,
  type VehicleCollection
} from "./toGeoJson";

export const SRC_VEHICLES = "vt-vehicles";
export const SRC_SEL_LINES = "vt-sel-lines";
export const SRC_SEL_POINTS = "vt-sel-points";

export const LAYER_PLAN = "vt-plan";
export const LAYER_TRAIL = "vt-trail";
export const LAYER_GAP = "vt-gap";
export const LAYER_PINGS = "vt-pings";
export const LAYER_HALO = "vt-vehicle-halo";
export const LAYER_CORE = "vt-vehicle-core";
export const LAYER_RING = "vt-vehicle-ring";
export const LAYER_STOP = "vt-stop";
export const LAYER_STOP_MARK = "vt-stop-mark";
export const LAYER_STOP_LABEL = "vt-stop-label";

const RADIUS: Record<MapStatusTone, number> = {
  idle: 4.5,
  ok: 6,
  med: 6.5,
  high: 7,
  crit: 7.5,
  off: 7.5
};
const RING_GAP = 4;
const DIM_OPACITY = 0.22;

const FONT_MEDIUM = ["DIN Pro Medium", "Arial Unicode MS Regular"];
const FONT_BOLD = ["DIN Pro Bold", "Arial Unicode MS Bold"];

// Las expresiones de estilo no tienen tipo útil en @types/mapbox-gl v3; se tipan como any[].
type Expr = any[];

const toneColor = (p: MapPaletteTokens): Expr => [
  "match",
  ["get", "tone"],
  "ok",
  p.ok,
  "med",
  p.med,
  "high",
  p.high,
  "crit",
  p.crit,
  "off",
  p.off,
  p.idle
];

const toneRadius = (extra = 0): Expr => [
  "match",
  ["get", "tone"],
  "ok",
  RADIUS.ok + extra,
  "med",
  RADIUS.med + extra,
  "high",
  RADIUS.high + extra,
  "crit",
  RADIUS.crit + extra,
  "off",
  RADIUS.off + extra,
  RADIUS.idle + extra
];

const stopColor = (p: MapPaletteTokens): Expr => [
  "case",
  ["==", ["get", "role"], "org"],
  p.cpLime,
  ["==", ["get", "role"], "dst"],
  p.plOrange,
  ["==", ["get", "status"], "here"],
  p.sPar,
  ["==", ["get", "status"], "done"],
  p.ok,
  p.sSin
];

const isKind = (kind: string): Expr => ["==", ["get", "kind"], kind];

export function addTowerLayers(map: mapboxgl.Map, palette: MapPaletteTokens): void {
  const empty = (): GeoJSON.FeatureCollection => ({ type: "FeatureCollection", features: [] });
  if (!map.getSource(SRC_SEL_LINES))
    map.addSource(SRC_SEL_LINES, { type: "geojson", data: empty() });
  if (!map.getSource(SRC_SEL_POINTS)) {
    map.addSource(SRC_SEL_POINTS, { type: "geojson", data: empty() });
  }
  if (!map.getSource(SRC_VEHICLES)) map.addSource(SRC_VEHICLES, { type: "geojson", data: empty() });

  const add = (layer: mapboxgl.AnyLayer) => {
    if (!map.getLayer(layer.id)) map.addLayer(layer);
  };
  const lineLayout = { "line-cap": "round", "line-join": "round" } as const;

  add({
    id: LAYER_PLAN,
    type: "line",
    source: SRC_SEL_LINES,
    filter: isKind("plan") as mapboxgl.Expression,
    layout: lineLayout,
    paint: {
      "line-color": palette.route,
      "line-width": 2,
      "line-opacity": 0.5,
      "line-dasharray": [1, 1.25]
    }
  });
  add({
    id: LAYER_TRAIL,
    type: "line",
    source: SRC_SEL_LINES,
    filter: isKind("trail") as mapboxgl.Expression,
    layout: lineLayout,
    paint: { "line-color": palette.trail, "line-width": 3.1 }
  });
  add({
    id: LAYER_GAP,
    type: "line",
    source: SRC_SEL_LINES,
    filter: isKind("gap") as mapboxgl.Expression,
    layout: { "line-join": "round" },
    paint: { "line-color": palette.crit, "line-width": 2.2, "line-dasharray": [0.7, 1.1] }
  });
  add({
    id: LAYER_PINGS,
    type: "circle",
    source: SRC_SEL_POINTS,
    filter: isKind("ping") as mapboxgl.Expression,
    paint: {
      "circle-radius": 2.1,
      "circle-color": palette.surface,
      "circle-stroke-color": palette.trail,
      "circle-stroke-width": 1.7
    }
  });

  add({
    id: LAYER_HALO,
    type: "circle",
    source: SRC_VEHICLES,
    filter: [
      "all",
      ["match", ["get", "tone"], ["off", "crit"], true, false],
      ["==", ["get", "dim"], 0]
    ] as mapboxgl.Expression,
    paint: {
      "circle-radius": toneRadius(3) as mapboxgl.Expression,
      "circle-color": "rgba(0,0,0,0)",
      "circle-stroke-color": toneColor(palette) as mapboxgl.Expression,
      "circle-stroke-width": 2,
      "circle-stroke-opacity": 0.6
    }
  });
  add({
    id: LAYER_CORE,
    type: "circle",
    source: SRC_VEHICLES,
    paint: {
      "circle-radius": toneRadius() as mapboxgl.Expression,
      "circle-color": toneColor(palette) as mapboxgl.Expression,
      "circle-stroke-color": palette.surface,
      "circle-stroke-width": 2,
      "circle-opacity": ["case", ["==", ["get", "dim"], 1], DIM_OPACITY, 1] as mapboxgl.Expression,
      "circle-stroke-opacity": [
        "case",
        ["==", ["get", "dim"], 1],
        DIM_OPACITY,
        1
      ] as mapboxgl.Expression
    }
  });
  add({
    id: LAYER_RING,
    type: "circle",
    source: SRC_VEHICLES,
    filter: ["==", ["get", "selected"], 1] as mapboxgl.Expression,
    paint: {
      "circle-radius": toneRadius(RING_GAP) as mapboxgl.Expression,
      "circle-color": "rgba(0,0,0,0)",
      "circle-stroke-color": palette.ink,
      "circle-stroke-width": 2.5
    }
  });

  add({
    id: LAYER_STOP,
    type: "circle",
    source: SRC_SEL_POINTS,
    filter: isKind("stop") as mapboxgl.Expression,
    paint: {
      "circle-radius": 9,
      "circle-color": palette.surface,
      "circle-stroke-color": stopColor(palette) as mapboxgl.Expression,
      "circle-stroke-width": 3.5
    }
  });
  add({
    id: LAYER_STOP_MARK,
    type: "symbol",
    source: SRC_SEL_POINTS,
    filter: isKind("stop") as mapboxgl.Expression,
    layout: {
      "text-field": ["get", "mark"],
      "text-font": FONT_BOLD,
      "text-size": 10,
      "text-allow-overlap": true,
      "text-ignore-placement": true
    },
    paint: {
      "text-color": [
        "case",
        ["==", ["get", "role"], "org"],
        palette.ink,
        stopColor(palette)
      ] as mapboxgl.Expression
    }
  });
  add({
    id: LAYER_STOP_LABEL,
    type: "symbol",
    source: SRC_SEL_POINTS,
    filter: isKind("stop") as mapboxgl.Expression,
    layout: {
      "text-field": ["get", "label"],
      "text-font": FONT_MEDIUM,
      "text-size": 10.5,
      "text-anchor": "left",
      "text-offset": [1.3, 0],
      "text-allow-overlap": true,
      "text-ignore-placement": true
    },
    paint: {
      "text-color": palette.ink,
      "text-halo-color": palette.surface,
      "text-halo-width": 2
    }
  });
}

export interface ITowerData {
  vehicles: VehicleCollection;
  lines: SelectionLines;
  points: SelectionPoints;
}

export const emptyTowerData = (): ITowerData => ({
  vehicles: emptyCollection(),
  lines: emptyCollection(),
  points: emptyCollection()
});

export function setTowerData(map: mapboxgl.Map, data: ITowerData): void {
  const set = (id: string, fc: object) => {
    const src = map.getSource(id) as mapboxgl.GeoJSONSource | undefined;
    // @types/mapbox-gl v3 tipa setData con GeoJSON de v3; en 1.13 recibe cualquier GeoJSON válido.
    src?.setData(fc as Parameters<mapboxgl.GeoJSONSource["setData"]>[0]);
  };
  set(SRC_VEHICLES, data.vehicles);
  set(SRC_SEL_LINES, data.lines);
  set(SRC_SEL_POINTS, data.points);
}
