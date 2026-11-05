"use client";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { IFleetItem, IVehicleTowerParams } from "../../types/vehicleTower";
import { buildTimeline } from "./drawerModel";
import styles from "./TripDrawer.module.scss";

interface IStateTimelineProps {
  item: IFleetItem;
  t: number;
  params: IVehicleTowerParams;
}

export function StateTimeline({ item, t, params }: IStateTimelineProps) {
  const { trip, evaluation: e } = item;
  const tl = buildTimeline(trip, e, t, params);
  const ref = useRef<HTMLUListElement>(null);
  const [scroll, setScroll] = useState({ can: false, end: true });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const can = el.scrollHeight > el.clientHeight + 1;
    setScroll({ can, end: !can || el.scrollTop + el.clientHeight >= el.scrollHeight - 2 });
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, tl.rows.length, trip.tripId]);

  const total = tl.rows.length + 1;
  return (
    <div className={styles.stWrap}>
      <ul
        ref={ref}
        className={`${styles.stl} ${styles.stScroll} ${scroll.end ? styles.stEnd : ""}`}
        onScroll={measure}
        tabIndex={scroll.can ? 0 : undefined}
        aria-label={scroll.can ? "Historial de estados" : undefined}
      >
        <li className={`${styles.stItem} ${styles.stCur} ${styles[`lv_${tl.head.tone}`]}`}>
          <span className={styles.stDot} aria-hidden />
          <div className={styles.stBox}>
            <div className={styles.stRow}>
              <span className={styles.stName}>{tl.head.name}</span>
              <span className={`${styles.stDate} ${styles.num}`}>{tl.head.date}</span>
            </div>
            {tl.head.detail && <div className={styles.stNote}>{tl.head.detail}</div>}
          </div>
        </li>
        {tl.rows.map((r, i) => {
          const cls =
            r.kind === "state"
              ? `${styles.stState} ${styles[`st_${r.stateKey}`]}`
              : r.kind === "alert"
                ? `${styles.stAlert} ${styles[`lv_${r.tone}`]}`
                : styles.stMarker;
          return (
            <li key={`${r.kind}-${r.at}-${i}`} className={`${styles.stItem} ${cls}`}>
              <span className={styles.stDot} aria-hidden />
              <div className={styles.stBox}>
                <div className={styles.stRow}>
                  <span className={styles.stName}>{r.name}</span>
                  <span className={`${styles.stDate} ${styles.num}`}>{r.date}</span>
                </div>
                {r.detail && <div className={styles.stNote}>{r.detail}</div>}
              </div>
            </li>
          );
        })}
      </ul>
      {scroll.can && !scroll.end && (
        <div className={styles.stMore}>{total} eventos · desliza para ver el historial ↓</div>
      )}
    </div>
  );
}
