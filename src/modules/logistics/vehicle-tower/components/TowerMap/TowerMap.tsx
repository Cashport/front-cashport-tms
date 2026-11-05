"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getMapPalette, type MapThemeMode } from "@/theme/mapPalette";
import { MAPS_ACCESS_TOKEN } from "@/utils/constants/globalConstants";
import { getAppZoom } from "@/utils/utils";
import type { IFleetItem } from "../../types/vehicleTower";
import { MapControls } from "./MapControls";
import { MapTooltip } from "./MapTooltip";
import { addTowerLayers, LAYER_CORE, setTowerData } from "./mapLayers";
import {
  fleetBounds,
  selectionToGeoJson,
  tooltipOf,
  tripBounds,
  vehiclesToGeoJson,
  type LngLatBounds
} from "./toGeoJson";
import styles from "./TowerMap.module.scss";

const STYLE_URL: Record<MapThemeMode, string> = {
  light: "mapbox://styles/mapbox/streets-v12",
  dark: "mapbox://styles/mapbox/dark-v11"
};

const DEFAULT_CENTER: [number, number] = [-74.3, 4.6];
const DEFAULT_ZOOM = 4.8;
const ZOOM_STEP = Math.log2(1.6);
const DRAWER_WIDTH = 372;
const DRAWER_MIN_SCREEN = 860;
const CLICK_TOLERANCE = 5;

export interface TowerMapProps {
  fleet: IFleetItem[];
  t: number;
  nowMs?: number;
  selectedTripId: number | null;
  mode: MapThemeMode;
  onSelect: (tripId: number | null) => void;
  onHover?: (tripId: number | null) => void;
  drawerOpen?: boolean;
}

interface IHover {
  tripId: number;
  x: number;
  y: number;
}

type Unavailable = "token" | "style" | null;

function fitPadding(el: HTMLElement, rightExtra = 0) {
  const base = 60;
  const left = base;
  const right = base + Math.min(rightExtra, el.clientWidth * 0.5);
  const hMax = el.clientWidth * 0.85;
  const kh = left + right > hMax ? hMax / (left + right) : 1;
  const vert = Math.min(base, el.clientHeight * 0.3);
  return { top: vert, bottom: vert, left: left * kh, right: right * kh };
}

export function TowerMap({
  fleet,
  t,
  nowMs,
  selectedTripId,
  mode,
  onSelect,
  onHover,
  drawerOpen
}: TowerMapProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const styleReadyRef = useRef(false);
  const styleUrlRef = useRef<string>(STYLE_URL[mode]);
  const fittedRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const [unavailable, setUnavailable] = useState<Unavailable>(MAPS_ACCESS_TOKEN ? null : "token");
  const [hover, setHover] = useState<IHover | null>(null);
  const [width, setWidth] = useState(0);

  const live = useRef({ fleet, t, nowMs, selectedTripId, mode, onSelect, onHover });
  live.current = { fleet, t, nowMs, selectedTripId, mode, onSelect, onHover };

  const pushData = useCallback(() => {
    const map = mapRef.current;
    if (!map || !styleReadyRef.current) return;
    const { fleet: f, t: now, nowMs: anchor, selectedTripId: sel } = live.current;
    const selected = sel === null ? undefined : f.find((x) => x.trip.tripId === sel);
    const { lines, points } = selectionToGeoJson(selected, now, anchor ?? now);
    setTowerData(map, { vehicles: vehiclesToGeoJson(f, now, sel), lines, points });
  }, []);

  const fitTo = useCallback((bounds: LngLatBounds | null, opts: mapboxgl.FitBoundsOptions) => {
    const map = mapRef.current;
    if (!map || !bounds) return;
    map.fitBounds(bounds, { maxZoom: 12, ...opts });
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!MAPS_ACCESS_TOKEN || !el) return;
    let cancelled = false;
    let map: mapboxgl.Map | null = null;
    let resizeObs: ResizeObserver | null = null;

    (async () => {
      try {
        const mod = await import("mapbox-gl");
        if (cancelled) return;
        const gl = (mod as { default?: typeof mapboxgl }).default ?? (mod as typeof mapboxgl);
        (gl as { accessToken: string }).accessToken = MAPS_ACCESS_TOKEN;
        map = new gl.Map({
          container: el,
          style: STYLE_URL[live.current.mode],
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          dragRotate: false,
          pitchWithRotate: false
        });
        mapRef.current = map;
        styleUrlRef.current = STYLE_URL[live.current.mode];
        map.touchZoomRotate.disableRotation();
        map.doubleClickZoom.disable();

        map.on("style.load", () => {
          styleReadyRef.current = true;
          addTowerLayers(map as mapboxgl.Map, getMapPalette(live.current.mode));
          pushData();
          setUnavailable(null);
          setMapReady(true);
        });
        map.on("error", () => {
          if (!styleReadyRef.current) setUnavailable("style");
        });

        const pick = (point: mapboxgl.Point) => {
          const m = map as mapboxgl.Map;
          if (!m.getLayer(LAYER_CORE)) return null;
          const box: [mapboxgl.PointLike, mapboxgl.PointLike] = [
            [point.x - CLICK_TOLERANCE, point.y - CLICK_TOLERANCE],
            [point.x + CLICK_TOLERANCE, point.y + CLICK_TOLERANCE]
          ];
          const feats = m.queryRenderedFeatures(box, { layers: [LAYER_CORE] });
          const id = feats.length ? Number(feats[0].properties?.tripId) : null;
          return id !== null && Number.isFinite(id) ? id : null;
        };
        map.on("click", (e) => live.current.onSelect(pick(e.point)));
        map.on("mousemove", (e) => {
          const id = pick(e.point);
          (map as mapboxgl.Map).getCanvas().style.cursor = id === null ? "" : "pointer";
          const zoom = getAppZoom();
          setHover((prev) => {
            if (id === null) return prev === null ? prev : null;
            if (prev?.tripId !== id) live.current.onHover?.(id);
            return { tripId: id, x: e.point.x / zoom, y: e.point.y / zoom };
          });
          if (id === null) live.current.onHover?.(null);
        });
        map.on("mouseout", () => {
          setHover(null);
          live.current.onHover?.(null);
        });

        const zoneWidth = () => el.clientWidth / getAppZoom();
        resizeObs = new ResizeObserver(() => {
          setWidth(zoneWidth());
          map?.resize();
        });
        resizeObs.observe(el);
        setWidth(zoneWidth());
      } catch {
        if (!cancelled) setUnavailable("style");
      }
    })();

    return () => {
      cancelled = true;
      resizeObs?.disconnect();
      map?.remove();
      mapRef.current = null;
      styleReadyRef.current = false;
      fittedRef.current = false;
      setMapReady(false);
    };
  }, [pushData]);

  useEffect(() => {
    const map = mapRef.current;
    const url = STYLE_URL[mode];
    if (!map || url === styleUrlRef.current) return;
    styleUrlRef.current = url;
    styleReadyRef.current = false;
    map.setStyle(url, { diff: false });
  }, [mode, mapReady]);

  useEffect(() => {
    pushData();
  }, [fleet, t, nowMs, selectedTripId, mapReady, pushData]);

  useEffect(() => {
    if (!mapReady || fittedRef.current || !fleet.length) return;
    fittedRef.current = true;
    const el = canvasRef.current;
    if (el) fitTo(fleetBounds(fleet, t), { padding: fitPadding(el), animate: false });
  }, [mapReady, fleet, t, fitTo]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!mapReady || selectedTripId === null || !el) return;
    const { fleet: f, t: now } = live.current;
    const item = f.find((x) => x.trip.tripId === selectedTripId);
    if (!item) return;
    const drawer = window.innerWidth > DRAWER_MIN_SCREEN ? DRAWER_WIDTH * getAppZoom() : 0;
    fitTo(tripBounds(item.trip, now), { padding: fitPadding(el, drawer), duration: 550 });
  }, [selectedTripId, mapReady, fitTo]);

  const zoomBy = (delta: number) => {
    const map = mapRef.current;
    if (map) map.easeTo({ zoom: map.getZoom() + delta, duration: 300 });
  };
  const fitFleet = () => {
    const el = canvasRef.current;
    if (el) fitTo(fleetBounds(live.current.fleet, live.current.t), { padding: fitPadding(el) });
  };

  const hovered = useMemo(
    () => (hover ? fleet.find((x) => x.trip.tripId === hover.tripId) : undefined),
    [hover, fleet]
  );
  const tip = hovered ? tooltipOf(hovered) : null;

  return (
    <div className={styles.root}>
      <div ref={canvasRef} className={styles.canvas} />
      {!unavailable && (
        <MapControls
          onZoomIn={() => zoomBy(ZOOM_STEP)}
          onZoomOut={() => zoomBy(-ZOOM_STEP)}
          onFit={fitFleet}
          drawerOpen={drawerOpen}
        />
      )}
      {tip && hover && (
        <MapTooltip
          title={tip.title}
          why={tip.why}
          tr={tip.tr}
          x={hover.x}
          y={hover.y}
          containerWidth={width}
        />
      )}
      {unavailable && (
        <div className={styles.notice} role="status">
          {unavailable === "token"
            ? "Mapa no disponible: falta configurar el token de Mapbox."
            : "Mapa no disponible: no se pudo cargar el mapa. Verifica tu conexión."}
        </div>
      )}
    </div>
  );
}
