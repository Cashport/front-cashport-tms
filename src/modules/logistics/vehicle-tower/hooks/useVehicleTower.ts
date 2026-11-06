"use client";
import { useCallback, useEffect, useMemo } from "react";
import useSWR from "swr";
import {
  getVehicleTower,
  getVehicleTowerHistory,
  getVehicleTowerTrip
} from "@/services/logistics/vehicle-tower";
import { adaptHistoryTrip, adaptTrip, adaptUnassigned, mergeDetail } from "../lib/adapter";
import { snapshot } from "../lib/filters";
import { useVehicleTowerStore } from "../store/useVehicleTowerStore";
import type {
  IFleetItem,
  IVehicleTowerTrip,
  IVehicleTowerUnassignedTr
} from "../types/vehicleTower";

export const TOWER_TICK_MS = 30_000;

const SWR_OPTIONS = { revalidateOnFocus: false, keepPreviousData: true };

export function useVehicleTower(): {
  fleet: IFleetItem[];
  t: number;
  ready: boolean;
  isLoading: boolean;
  error: Error | undefined;
  retry: () => void;
  unassigned: IVehicleTowerUnassignedTr[] | undefined;
  detailLoading: boolean;
  detailError: Error | undefined;
} {
  const now = useVehicleTowerStore((s) => s.now);
  const mode = useVehicleTowerStore((s) => s.mode);
  const cursor = useVehicleTowerStore((s) => s.historyCursor);
  const range = useVehicleTowerStore((s) => s.historyRange);
  const scope = useVehicleTowerStore((s) => s.scope);
  const params = useVehicleTowerStore((s) => s.params);
  const followUps = useVehicleTowerStore((s) => s.followUps);
  const selectedTripId = useVehicleTowerStore((s) => s.selectedTripId);
  const setTrips = useVehicleTowerStore((s) => s.setTrips);
  const setParams = useVehicleTowerStore((s) => s.setParams);
  const tick = useVehicleTowerStore((s) => s.tick);
  const isHistory = mode === "history";

  const live = useSWR("vehicle-tower", getVehicleTower, {
    ...SWR_OPTIONS,
    refreshInterval: isHistory ? 0 : TOWER_TICK_MS
  });
  const history = useSWR(
    isHistory ? ["vehicle-tower-history", range.from, range.to] : null,
    ([, from, to]) => getVehicleTowerHistory(from, to),
    SWR_OPTIONS
  );
  const detail = useSWR(
    selectedTripId === null ? null : ["vehicle-tower-trip", selectedTripId],
    ([, id]) => getVehicleTowerTrip(id),
    { revalidateOnFocus: false }
  );

  const trips = useMemo<IVehicleTowerTrip[]>(() => {
    if (isHistory && history.data) return history.data.trips.map(adaptHistoryTrip);
    return live.data?.trips.map(adaptTrip) ?? [];
  }, [isHistory, history.data, live.data]);

  useEffect(() => {
    setTrips(trips);
  }, [trips, setTrips]);

  const sbHoras = live.data?.params.sbHoras;
  useEffect(() => {
    if (sbHoras !== undefined && sbHoras !== useVehicleTowerStore.getState().params.sbHoras) {
      setParams({ ...useVehicleTowerStore.getState().params, sbHoras });
    }
  }, [sbHoras, setParams]);

  useEffect(() => {
    const id = setInterval(tick, TOWER_TICK_MS);
    return () => clearInterval(id);
  }, [tick]);

  const merged = useMemo<IVehicleTowerTrip[]>(
    () =>
      trips.map((trip) => {
        const withDetail =
          detail.data && detail.data.tripId === trip.tripId ? mergeDetail(trip, detail.data) : trip;
        const extra = followUps[trip.tripId];
        return extra?.length
          ? { ...withDetail, followUps: [...withDetail.followUps, ...extra] }
          : withDetail;
      }),
    [trips, detail.data, followUps]
  );

  const t = isHistory ? cursor : now.getTime();
  const fleet = useMemo(() => snapshot(merged, t, params, scope), [merged, t, params, scope]);
  const unassigned = useMemo(() => live.data?.trsSinVehiculo?.map(adaptUnassigned), [live.data]);

  const source = isHistory ? history : live;
  const retry = useCallback(() => {
    source.mutate();
  }, [source]);

  return {
    fleet,
    t,
    ready: trips.length > 0,
    isLoading: source.isLoading,
    error: source.error,
    retry,
    unassigned,
    detailLoading: detail.isLoading,
    detailError: detail.error
  };
}
