"use client";
import { memo } from "react";
import type { CSSProperties } from "react";
import type { MapStatusTone } from "@/theme/mapPalette";
import { departureOf, driverName, gpsAgo } from "../../lib/tracking";
import { dt, hhmm, HR } from "../../lib/time";
import type { IFleetItem } from "../../types/vehicleTower";
import styles from "./FleetPanel.module.scss";

export const FLEET_ROW_HEIGHT = 62;

export const fleetRowDomId = (tripId: number) => `vt-row-${tripId}`;

const titleCase = (s: string) => s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

interface IRowText {
  why: string;
  tone: MapStatusTone;
  when: string;
  more?: string;
}

function sideText({ trip, evaluation: e }: IFleetItem, t: number): IRowText {
  if (e.top) {
    const more = e.conditions.length > 1 ? `+ ${e.conditions[1].name}` : undefined;
    return { why: e.top.short, tone: e.top.lvl, when: trip.transferRequest?.id ?? "", more };
  }
  if (e.bucket === "ok") {
    return {
      why: e.state,
      tone: "ok",
      when: `GPS ${gpsAgo(trip, t)}`
    };
  }
  if (e.isScheduled) {
    const dep = departureOf(trip);
    return {
      why: "Programado",
      tone: "idle",
      when: `Sale ${(dep - t) / HR < 20 ? hhmm(dep) : dt(dep)}`
    };
  }
  return {
    why: "Sin servicio",
    tone: "idle",
    when: trip.vehicle.municipality ? titleCase(trip.vehicle.municipality) : "--"
  };
}

function routeText({ trip }: IFleetItem): string {
  if (!trip.transferRequest) return `${trip.vehicle.type} · ${trip.carrier.name}`;
  const n = trip.stops.length;
  const first = trip.stops[0]?.name ?? "";
  const last = trip.stops[n - 1]?.name ?? "";
  const mid = n > 2 ? ` · ${n - 2} parada${n > 3 ? "s" : ""}` : "";
  return `${trip.transferRequest.id} · ${first} → ${last}${mid}`;
}

export interface IFleetRowProps {
  item: IFleetItem;
  t: number;
  selected: boolean;
  onSelect: (tripId: number) => void;
  style?: CSSProperties;
  index: number;
  count: number;
}

function FleetRowBase({ item, t, selected, onSelect, style, index, count }: IFleetRowProps) {
  const { trip, evaluation } = item;
  const side = sideText(item, t);
  const driver = driverName(trip);
  return (
    <div
      id={fleetRowDomId(trip.tripId)}
      role="option"
      aria-selected={selected}
      aria-posinset={index + 1}
      aria-setsize={count}
      aria-label={`${trip.vehicle.plate}, ${driver}, ${side.why}`}
      className={`${styles.row} ${selected ? styles.rowSel : ""}`}
      style={style}
      onClick={() => onSelect(trip.tripId)}
    >
      <span className={`${styles.dot} ${styles[`d_${evaluation.level}`]}`} aria-hidden />
      <span className={styles.rMain}>
        <span className={styles.rL1}>
          <span className={styles.plate}>{trip.vehicle.plate}</span>
          <span className={styles.rName}>{driver}</span>
        </span>
        <span className={styles.rL2}>{routeText(item)}</span>
      </span>
      <span className={styles.rSide}>
        <span className={`${styles.rWhy} ${styles[`w_${side.tone}`]}`}>{side.why}</span>
        <span className={styles.rWhen}>
          {side.more ? <span className={styles.more}>{side.more}</span> : side.when}
        </span>
      </span>
    </div>
  );
}

export const FleetRow = memo(FleetRowBase);
