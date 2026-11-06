"use client";
import { CaretRight } from "phosphor-react";
import type { FleetBucket } from "../../types/vehicleTower";
import styles from "./FleetPanel.module.scss";

export function FleetExpandButton({
  counts,
  onClick
}: {
  counts: Record<FleetBucket, number>;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.expand}
      aria-label="Mostrar panel de flota"
      onClick={onClick}
    >
      <CaretRight size={15} weight="bold" aria-hidden />
      Flota
      <span className={styles.expandCount} title="Con alerta">
        <i className={styles.d_crit} />
        {counts.alert}
      </span>
      <span className={styles.expandCount} title="Sin control">
        <i className={styles.d_off} />
        {counts.off}
      </span>
      <span className={styles.expandCount} title="Activos">
        <i className={styles.d_ok} />
        {counts.ok}
      </span>
    </button>
  );
}
