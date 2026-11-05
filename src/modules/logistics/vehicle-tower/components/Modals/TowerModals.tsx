"use client";
import { useMemo } from "react";
import type { MapThemeMode } from "@/theme/mapPalette";
import { AdvancedFiltersModal } from "@/components/ui/advanced-filters-modal/AdvancedFiltersModal";
import type {
  AdvancedFilterValues,
  IAdvancedFilterCategory
} from "@/components/ui/advanced-filters-modal/AdvancedFiltersModal";
import { FILTER_CATEGORIES, labelOf } from "../../lib/filters";
import type { FilterCategoryId } from "../../lib/filters";
import { useVehicleTowerStore } from "../../store/useVehicleTowerStore";
import type { IVehicleTowerTrip } from "../../types/vehicleTower";
import { DriverModal, VehicleModal } from "./DocumentsModal";
import { ObservationsModal } from "./ObservationsModal";
import { RulesModal } from "./RulesModal";
import { TripItemsModal } from "./TripItemsModal";

export type TowerModalKind = "vehicle" | "driver" | "items" | "observations" | "rules" | "filters";

interface ITowerModalsProps {
  open: TowerModalKind | null;
  onClose: () => void;
  mode: MapThemeMode;
  trip: IVehicleTowerTrip | null;
}

export function TowerModals({ open, onClose, mode, trip }: ITowerModalsProps) {
  const now = useVehicleTowerStore((s) => s.now).getTime();
  return (
    <>
      <RulesModal open={open === "rules"} onClose={onClose} mode={mode} />
      <TowerFiltersModal open={open === "filters"} onClose={onClose} />
      {trip && (
        <>
          <VehicleModal
            open={open === "vehicle"}
            onClose={onClose}
            mode={mode}
            trip={trip}
            now={now}
          />
          <DriverModal
            open={open === "driver"}
            onClose={onClose}
            mode={mode}
            trip={trip}
            now={now}
          />
          <TripItemsModal open={open === "items"} onClose={onClose} mode={mode} trip={trip} />
          <ObservationsModal
            open={open === "observations"}
            onClose={onClose}
            mode={mode}
            trip={trip}
          />
        </>
      )}
    </>
  );
}

function TowerFiltersModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const trips = useVehicleTowerStore((s) => s.trips);
  const scope = useVehicleTowerStore((s) => s.scope);
  const filters = useVehicleTowerStore((s) => s.filters);
  const setFilter = useVehicleTowerStore((s) => s.setFilter);
  const clearFilters = useVehicleTowerStore((s) => s.clearFilters);

  const categories = useMemo<IAdvancedFilterCategory[]>(
    () =>
      FILTER_CATEGORIES.map((c) => ({
        id: c.id,
        name: c.name,
        options: c.options(trips, scope).map((value) => ({
          value,
          label: labelOf(c.id, value)
        }))
      })),
    [trips, scope]
  );

  const apply = (next: AdvancedFilterValues) => {
    if (FILTER_CATEGORIES.every((c) => !next[c.id]?.length)) clearFilters();
    else FILTER_CATEGORIES.forEach((c) => setFilter(c.id as FilterCategoryId, next[c.id] ?? []));
    onClose();
  };

  return (
    <AdvancedFiltersModal
      open={open}
      categories={categories}
      value={filters}
      onApply={apply}
      onClose={onClose}
      subtitle={
        scope
          ? `Ves solo los servicios de tu PSL (${scope})`
          : "Encuentra y selecciona múltiples opciones"
      }
    />
  );
}
