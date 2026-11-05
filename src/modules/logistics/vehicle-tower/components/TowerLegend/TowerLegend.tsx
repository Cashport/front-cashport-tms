"use client";
import type { MouseEvent } from "react";
import type { MapStatusTone } from "@/theme/mapPalette";
import { useVehicleTowerStore } from "../../store/useVehicleTowerStore";
import styles from "./TowerLegend.module.scss";

const LEGEND: Array<{ tone: MapStatusTone; label: string }> = [
  { tone: "ok", label: "En servicio" },
  { tone: "med", label: "Demora o sin cierre" },
  { tone: "high", label: "Riesgo · detenido · sin seguimiento" },
  { tone: "crit", label: "Stand by" },
  { tone: "off", label: "Sin control" },
  { tone: "idle", label: "Programado o sin servicio" }
];

export interface ITowerLegendProps {
  onOpenRules?: () => void;
}

export function TowerLegend({ onOpenRules }: ITowerLegendProps) {
  const levels = useVehicleTowerStore((s) => s.levels);
  const toggleLevel = useVehicleTowerStore((s) => s.toggleLevel);
  const clearLevels = useVehicleTowerStore((s) => s.clearLevels);
  const filtering = levels.length > 0;
  return (
    <div
      className={`${styles.legend} ${filtering ? styles.filtering : ""}`}
      role="group"
      aria-label="Leyenda de estados"
    >
      {LEGEND.map(({ tone, label }) => {
        const on = levels.includes(tone);
        return (
          <button
            key={tone}
            type="button"
            aria-pressed={on}
            title="Clic para filtrar · Shift + clic para sumar estados"
            className={`${styles.item} ${on ? styles.on : ""}`}
            onClick={(e: MouseEvent) => toggleLevel(tone, e.shiftKey)}
          >
            <i className={`${styles.dot} ${styles[`d_${tone}`]}`} aria-hidden />
            {label}
          </button>
        );
      })}
      {filtering && (
        <button type="button" className={styles.link} onClick={clearLevels}>
          Quitar filtro
        </button>
      )}
      {onOpenRules && (
        <button type="button" className={`${styles.link} ${styles.rules}`} onClick={onOpenRules}>
          Reglas
        </button>
      )}
    </div>
  );
}
