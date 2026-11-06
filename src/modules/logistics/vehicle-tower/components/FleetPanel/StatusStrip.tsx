"use client";
import { BUCKET_LABELS } from "../../lib/rules";
import type { TowerBucketFilter } from "../../store/useVehicleTowerStore";
import type { FleetBucket } from "../../types/vehicleTower";
import styles from "./FleetPanel.module.scss";

const BUCKETS: TowerBucketFilter[] = ["ok", "alert", "off"];

export interface IStatusStripProps {
  bucketCounts: Record<FleetBucket, number>;
  bucket: TowerBucketFilter | null;
  showIdle: boolean;
  onToggleBucket: (bucket: TowerBucketFilter) => void;
  onToggleIdle: () => void;
}

export function StatusStrip({
  bucketCounts,
  bucket,
  showIdle,
  onToggleBucket,
  onToggleIdle
}: IStatusStripProps) {
  return (
    <div className={styles.strip}>
      <div className={styles.tiles}>
        {BUCKETS.map((b) => (
          <button
            key={b}
            type="button"
            title={BUCKET_LABELS[b][2]}
            aria-pressed={bucket === b}
            className={`${styles.tile} ${styles[`tile_${b}`]} ${bucket === b ? styles.tileOn : ""}`}
            onClick={() => onToggleBucket(b)}
          >
            <span className={styles.tileBar} />
            <span className={styles.tileN}>{bucketCounts[b]}</span>
            <span className={styles.tileL}>{BUCKET_LABELS[b][1]}</span>
            <span className={styles.tileD}>{BUCKET_LABELS[b][2]}</span>
          </button>
        ))}
      </div>
      <div className={styles.chipsRow}>
        <button
          type="button"
          aria-pressed={showIdle}
          className={`${styles.chipIdle} ${showIdle ? styles.chipOn : ""}`}
          onClick={onToggleIdle}
        >
          Sin servicio o programados · {bucketCounts.idle}
        </button>
      </div>
    </div>
  );
}
