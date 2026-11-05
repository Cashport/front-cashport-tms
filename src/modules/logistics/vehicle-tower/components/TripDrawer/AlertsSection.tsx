import { ago, dt, dur, HR } from "../../lib/time";
import { lastFollow, pingMs, departureOf } from "../../lib/sim";
import type { IFleetItem } from "../../types/vehicleTower";
import styles from "./TripDrawer.module.scss";

interface IAlertsSectionProps {
  item: IFleetItem;
  t: number;
  onOpenRules?: () => void;
}

export function AlertsSection({ item, t, onOpenRules }: IAlertsSectionProps) {
  const { trip, evaluation: e } = item;
  let body;
  if (e.conditions.length) {
    body = e.conditions.map((c) => (
      <div key={c.code} className={`${styles.whyItem} ${styles[`wy_${c.lvl}`]}`} title={c.rule}>
        <b>{c.name}</b>
        <span className={styles.whyText}>{c.detail}</span>
      </div>
    ));
  } else if (trip.transferRequest && e.isScheduled) {
    const sal = departureOf(trip);
    body = (
      <div className={`${styles.whyItem} ${styles.wy_idle}`}>
        <b>Programado</b>
        <span className={styles.whyText}>
          Sale el {dt(sal)} · en {dur((sal - t) / HR)}. Aún no aplica ninguna alerta.
        </span>
      </div>
    );
  } else if (trip.transferRequest) {
    body = (
      <div className={`${styles.whyItem} ${styles.wy_ok}`}>
        <b>{e.state}</b>
        <span className={styles.whyText}>
          Reporta GPS {ago((t - Math.min(t, pingMs(trip))) / HR)} · último seguimiento{" "}
          {ago((t - lastFollow(trip, t)) / HR)}
        </span>
      </div>
    );
  } else {
    return null;
  }
  return (
    <section className={styles.sec} aria-labelledby="vt-dw-why">
      <div className={styles.secHead}>
        <h3 id="vt-dw-why" className={styles.secTitle}>
          Por qué está aquí
        </h3>
        {onOpenRules && (
          <button type="button" className={styles.link} onClick={onOpenRules}>
            Reglas
          </button>
        )}
      </div>
      <div className={styles.why}>{body}</div>
    </section>
  );
}
