"use client";
import { useCallback, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import { CaretLeft, Lock, WarningCircle } from "phosphor-react";
import { List, useListRef } from "react-window";
import type { RowComponentProps } from "react-window";
import { FilterChips } from "@/components/ui/page-header-controls/page-header-controls";
import type { FilterChipItem } from "@/components/ui/page-header-controls/page-header-controls";
import { FILTER_CATEGORIES, labelOf } from "../../lib/filters";
import type { FilterCategoryId } from "../../lib/filters";
import { dt, hhmm, HR } from "../../lib/time";
import { buildMockUnassignedTrs } from "../../mocks/curatedFleet";
import { useVehicleTowerStore } from "../../store/useVehicleTowerStore";
import type { IFleetItem } from "../../types/vehicleTower";
import { FLEET_ROW_HEIGHT, FleetRow, fleetRowDomId } from "./FleetRow";
import { StatusStrip } from "./StatusStrip";
import type { IFilteredFleet } from "./useFilteredFleet";
import styles from "./FleetPanel.module.scss";

export interface IFleetPanelProps {
  filtered: IFilteredFleet;
  t: number;
  onCollapse: () => void;
}

interface IRowProps {
  rows: IFleetItem[];
  t: number;
  selectedTripId: number | null;
  onSelect: (tripId: number) => void;
}

function Row({ index, style, rows, t, selectedTripId, onSelect }: RowComponentProps<IRowProps>) {
  const item = rows[index];
  return (
    <FleetRow
      item={item}
      t={t}
      index={index}
      count={rows.length}
      style={style}
      selected={item.trip.tripId === selectedTripId}
      onSelect={onSelect}
    />
  );
}

const MAX_CHIP_VALUES = 2;

export function FleetPanel({ filtered, t, onCollapse }: IFleetPanelProps) {
  const { rows, bucketCounts } = filtered;
  const mode = useVehicleTowerStore((s) => s.mode);
  const scope = useVehicleTowerStore((s) => s.scope);
  const filters = useVehicleTowerStore((s) => s.filters);
  const bucket = useVehicleTowerStore((s) => s.bucket);
  const showIdle = useVehicleTowerStore((s) => s.showIdle);
  const selectedTripId = useVehicleTowerStore((s) => s.selectedTripId);
  const selectTrip = useVehicleTowerStore((s) => s.selectTrip);
  const toggleBucket = useVehicleTowerStore((s) => s.toggleBucket);
  const toggleIdle = useVehicleTowerStore((s) => s.toggleIdle);
  const clearFilter = useVehicleTowerStore((s) => s.clearFilter);
  const listRef = useListRef(null);
  const [unassigned] = useState(() => buildMockUnassignedTrs(useVehicleTowerStore.getState().now));
  const pending = useMemo(
    () =>
      unassigned.filter((x) => {
        const h = (new Date(x.departureAt).getTime() - t) / HR;
        return h < 24 && h > -2 && (!scope || x.psl === scope);
      }),
    [unassigned, t, scope]
  );

  const chips = useMemo<FilterChipItem[]>(
    () =>
      FILTER_CATEGORIES.filter((c) => filters[c.id].length).map((c) => {
        const vals = filters[c.id];
        const txt =
          vals
            .slice(0, MAX_CHIP_VALUES)
            .map((v) => labelOf(c.id as FilterCategoryId, v))
            .join(", ") +
          (vals.length > MAX_CHIP_VALUES ? ` +${vals.length - MAX_CHIP_VALUES}` : "");
        return { key: c.id, label: c.name, value: txt, onRemove: () => clearFilter(c.id) };
      }),
    [filters, clearFilter]
  );

  const rowProps = useMemo<IRowProps>(
    () => ({ rows, t, selectedTripId, onSelect: selectTrip }),
    [rows, t, selectedTripId, selectTrip]
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!rows.length) return;
      const cur = rows.findIndex((x) => x.trip.tripId === selectedTripId);
      let next = cur;
      if (e.key === "ArrowDown") next = Math.min(rows.length - 1, cur + 1);
      else if (e.key === "ArrowUp") next = cur < 0 ? 0 : Math.max(0, cur - 1);
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = rows.length - 1;
      else if (e.key === "Enter" || e.key === " ") next = cur < 0 ? 0 : cur;
      else return;
      e.preventDefault();
      selectTrip(rows[next].trip.tripId);
      listRef.current?.scrollToRow({ index: next, align: "smart" });
    },
    [rows, selectedTripId, selectTrip, listRef]
  );

  return (
    <aside className={styles.panel} aria-label="Flota">
      <div className={styles.head}>
        <div className={styles.title}>
          <h2>Estado de la flota</h2>
          {scope && (
            <span
              className={styles.scope}
              title="Tu usuario pertenece a esta PSL: solo ves sus servicios"
            >
              <Lock size={12} weight="bold" aria-hidden />
              PSL · {scope}
            </span>
          )}
          <span className={styles.asOf} suppressHydrationWarning>
            {mode === "now" ? `Corte ${hhmm(t)}` : `Histórico ${dt(t)}`}
          </span>
          <button
            type="button"
            className={styles.collapse}
            aria-label="Contraer panel"
            title="Contraer panel"
            onClick={onCollapse}
          >
            <CaretLeft size={15} weight="bold" aria-hidden />
          </button>
        </div>
        <StatusStrip
          bucketCounts={bucketCounts}
          bucket={bucket}
          showIdle={showIdle}
          onToggleBucket={toggleBucket}
          onToggleIdle={toggleIdle}
        />
        {chips.length > 0 && (
          <div className={styles.chipsBar}>
            <FilterChips chips={chips} />
          </div>
        )}
      </div>
      {rows.length ? (
        <List
          listRef={listRef}
          className={`${styles.list} hide-sb`}
          style={{ flex: 1, minHeight: 0 }}
          role="listbox"
          aria-label="Vehículos de la flota"
          aria-activedescendant={
            selectedTripId !== null && rows.some((x) => x.trip.tripId === selectedTripId)
              ? fleetRowDomId(selectedTripId)
              : undefined
          }
          tabIndex={0}
          onKeyDown={onKeyDown}
          rowComponent={Row}
          rowCount={rows.length}
          rowHeight={FLEET_ROW_HEIGHT}
          rowProps={rowProps}
          overscanCount={6}
        />
      ) : (
        <div className={styles.empty}>Ningún vehículo cumple los filtros en este momento.</div>
      )}
      <div className={styles.foot}>
        {pending.length ? (
          <>
            <span className={styles.footIc}>
              <WarningCircle size={15} weight="bold" aria-hidden />
            </span>
            <p>
              <b>{pending.length} TRs sin vehículo asignado</b> salen en menos de 24 h. No aparecen
              en el mapa: se gestionan en Riesgo de retraso en la salida.
            </p>
          </>
        ) : (
          <p>Todas las TRs de las próximas 24 h tienen vehículo asignado.</p>
        )}
      </div>
    </aside>
  );
}
