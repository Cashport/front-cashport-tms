"use client";
import { useMemo } from "react";
import type { MapStatusTone } from "@/theme/mapPalette";
import { matches } from "../../lib/filters";
import { countByBucket, sortKey, TONES } from "../../lib/rules";
import { useVehicleTowerStore } from "../../store/useVehicleTowerStore";
import type { FleetBucket, IFleetItem } from "../../types/vehicleTower";

export interface IFilteredFleet {
  rows: IFleetItem[];
  mapFleet: IFleetItem[];
  bucketCounts: Record<FleetBucket, number>;
  toneCounts: Record<MapStatusTone, number>;
}

export function useFilteredFleet(fleet: IFleetItem[], t: number): IFilteredFleet {
  const query = useVehicleTowerStore((s) => s.query);
  const filters = useVehicleTowerStore((s) => s.filters);
  const bucket = useVehicleTowerStore((s) => s.bucket);
  const levels = useVehicleTowerStore((s) => s.levels);
  const showIdle = useVehicleTowerStore((s) => s.showIdle);
  const selectedTripId = useVehicleTowerStore((s) => s.selectedTripId);

  const base = useMemo(
    () => fleet.filter((x) => matches(x, query, filters)),
    [fleet, query, filters]
  );

  const counts = useMemo(() => {
    const toneCounts = Object.fromEntries(TONES.map((k) => [k, 0])) as Record<
      MapStatusTone,
      number
    >;
    base.forEach((x) => toneCounts[x.evaluation.level]++);
    return { bucketCounts: countByBucket(base), toneCounts };
  }, [base]);

  const visible = useMemo(() => {
    const pass = (x: IFleetItem) =>
      levels.length
        ? levels.includes(x.evaluation.level)
        : bucket
          ? x.evaluation.bucket === bucket || (showIdle && x.evaluation.bucket === "idle")
          : x.evaluation.bucket !== "idle" || showIdle;
    return base.filter(pass);
  }, [base, levels, bucket, showIdle]);

  const rows = useMemo(
    () => visible.slice().sort((a, b) => sortKey(a, t) - sortKey(b, t)),
    [visible, t]
  );

  const mapFleet = useMemo(() => {
    if (selectedTripId === null || rows.some((x) => x.trip.tripId === selectedTripId)) return rows;
    const sel = base.find((x) => x.trip.tripId === selectedTripId);
    return sel ? [...rows, sel] : rows;
  }, [rows, base, selectedTripId]);

  return { rows, mapFleet, ...counts };
}
