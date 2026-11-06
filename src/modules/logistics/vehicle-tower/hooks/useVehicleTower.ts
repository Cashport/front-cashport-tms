"use client";
import { useEffect, useMemo } from "react";
import { snapshot } from "../lib/filters";
import { buildMockVehicleTower } from "../mocks/genFleet";
import { useVehicleTowerStore } from "../store/useVehicleTowerStore";
import type { IFleetItem, IVehicleTowerTrip } from "../types/vehicleTower";

// TODO(decisión): el prototipo no tiene reloj (su hora es fija, 02/11/2026 13:20); se usa 30 s. (este mensaje debe desaparecer cuando se integre el backend en los endpoints para tener datos reales).
export const TOWER_TICK_MS = 30_000;

export function useVehicleTower(): {
  fleet: IFleetItem[];
  t: number;
  ready: boolean;
} {
  const trips = useVehicleTowerStore((s) => s.trips);
  const now = useVehicleTowerStore((s) => s.now);
  const mode = useVehicleTowerStore((s) => s.mode);
  const cursor = useVehicleTowerStore((s) => s.historyCursor);
  const scope = useVehicleTowerStore((s) => s.scope);
  const params = useVehicleTowerStore((s) => s.params);
  const followUps = useVehicleTowerStore((s) => s.followUps);
  const setTrips = useVehicleTowerStore((s) => s.setTrips);
  const tick = useVehicleTowerStore((s) => s.tick);

  useEffect(() => {
    if (useVehicleTowerStore.getState().trips.length === 0) {
      const at = new Date();
      useVehicleTowerStore.setState({ now: at });
      setTrips(buildMockVehicleTower(at).trips);
    }
  }, [setTrips]);

  useEffect(() => {
    const id = setInterval(tick, TOWER_TICK_MS);
    return () => clearInterval(id);
  }, [tick]);

  const withFollowUps = useMemo<IVehicleTowerTrip[]>(
    () =>
      trips.map((trip) => {
        const extra = followUps[trip.tripId];
        return extra?.length ? { ...trip, followUps: [...trip.followUps, ...extra] } : trip;
      }),
    [trips, followUps]
  );

  const t = mode === "history" ? cursor : now.getTime();
  const fleet = useMemo(
    () => snapshot(withFollowUps, t, params, scope),
    [withFollowUps, t, params, scope]
  );
  return { fleet, t, ready: trips.length > 0 };
}
