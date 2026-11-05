"use client";
import { paletteToCssVars, type MapThemeMode } from "@/theme/mapPalette";
import { dt } from "../../lib/time";
import { useVehicleTowerStore, type TowerMode } from "../../store/useVehicleTowerStore";
import styles from "./TowerHeaderTitle.module.scss";

const OPTIONS: Array<{ value: TowerMode; label: string }> = [
  { value: "now", label: "Ahora" },
  { value: "history", label: "Histórico" }
];

export interface ITowerHeaderTitleProps {
  /** Tema resuelto: el header queda fuera del contenedor que define los tokens --vt-*. */
  mode: MapThemeMode;
}

export function TowerHeaderTitle({ mode: theme }: ITowerHeaderTitleProps) {
  const mode = useVehicleTowerStore((s) => s.mode);
  const now = useVehicleTowerStore((s) => s.now);
  const cursor = useVehicleTowerStore((s) => s.historyCursor);
  const setMode = useVehicleTowerStore((s) => s.setMode);
  return (
    <div className={styles.wrap} style={paletteToCssVars(theme)}>
      <span className={styles.clock} suppressHydrationWarning>
        {mode === "now" ? (
          <>
            <span className={styles.live} aria-hidden />
            En vivo · {dt(now.getTime())}
          </>
        ) : (
          dt(cursor)
        )}
      </span>
      <div className={styles.seg} role="group" aria-label="Momento">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={mode === o.value}
            onClick={() => setMode(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
