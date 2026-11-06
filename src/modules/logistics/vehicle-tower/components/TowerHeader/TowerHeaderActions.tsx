"use client";
import {
  FilterButton,
  HeaderSearch
} from "@/components/ui/page-header-controls/page-header-controls";
import { useVehicleTowerStore } from "../../store/useVehicleTowerStore";

export interface ITowerHeaderActionsProps {
  onOpenFilters?: () => void;
}

export function TowerHeaderActions({ onOpenFilters }: ITowerHeaderActionsProps) {
  const query = useVehicleTowerStore((s) => s.query);
  const setQuery = useVehicleTowerStore((s) => s.setQuery);
  const count = useVehicleTowerStore((s) =>
    Object.values(s.filters).reduce((n, vals) => n + vals.length, 0)
  );
  return (
    <>
      <span title={onOpenFilters ? undefined : "Próximamente"} className="inline-flex">
        <FilterButton onClick={() => onOpenFilters?.()} count={count} disabled={!onOpenFilters} />
      </span>
      <HeaderSearch
        value={query}
        onChange={setQuery}
        placeholder="Buscar placa, TR, trip, conductor, proveedor…"
      />
    </>
  );
}
