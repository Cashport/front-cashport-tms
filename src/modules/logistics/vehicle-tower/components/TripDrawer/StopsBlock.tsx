import { fracAt, pingMs, simSpeed } from "../../lib/sim";
import { dur, hhmm, HR, sdt } from "../../lib/time";
import type { IFleetItem, IVehicleTowerParams } from "../../types/vehicleTower";
import { etaOf, isDepartureOverdue, routeTotalKm, stopInfo, stopLabel } from "./drawerModel";
import type { IStopRow } from "./drawerModel";
import styles from "./TripDrawer.module.scss";

interface IStopsBlockProps {
  item: IFleetItem;
  t: number;
  params: IVehicleTowerParams;
}

function Late({ row, at }: { row: IStopRow; at: number }) {
  const h = (at - row.plan) / HR;
  return h > 0.5 ? <em className={styles.late}> +{dur(h)}</em> : null;
}

function StopReal({ row, n, item, t, params }: { row: IStopRow; n: number } & IStopsBlockProps) {
  const { trip, evaluation: e } = item;
  if (row.status === "done") {
    return row.index === 0 ? (
      <span className={`${styles.swReal} ${styles.swOk}`}>
        Salió {sdt(row.departure as number)}
        <Late row={row} at={row.departure as number} />
      </span>
    ) : (
      <span className={`${styles.swReal} ${styles.swOk}`}>
        {hhmm(row.arrival ?? (row.departure as number))} → {hhmm(row.departure as number)}
        <Late row={row} at={row.arrival ?? (row.departure as number)} />
      </span>
    );
  }
  if (row.status === "here") {
    const arr = row.arrival as number;
    return (
      <span className={`${styles.swReal} ${styles.swHere}`}>
        {row.index === 0 ? "Cargando" : `Llegó ${hhmm(arr)}`} · {dur((t - arr) / HR)}
        {row.index ? <Late row={row} at={arr} /> : null}
      </span>
    );
  }
  if (isDepartureOverdue(row, t, params)) {
    return (
      <span className={`${styles.swReal} ${styles.swOver}`}>
        Sin salir · vencida hace {dur((t - row.plan) / HR)}
      </span>
    );
  }
  const notStarted = e.state === "Sin iniciar" || e.state === "Programado";
  return (
    <span className={styles.swReal}>
      {row.index === 0 ? "Salida" : "ETA"}{" "}
      {sdt(etaOf(row, row.index === n - 1, notStarted, trip, t))}
    </span>
  );
}

export function StopsBlock({ item, t, params }: IStopsBlockProps) {
  const { trip, evaluation: e } = item;
  const rows = stopInfo(trip, t);
  const n = rows.length;
  if (!n) return null;
  const frac = fracAt(trip, Math.min(t, pingMs(trip)));
  const km = Math.round(routeTotalKm(trip) * (1 - frac));
  const speed = simSpeed(
    trip,
    e.state,
    e.conditions.some((c) => c.code === "GPS")
  );
  const done = rows.filter((r) => r.status === "done").length;
  const leg = Math.min(n - 1, Math.max(1, done));
  const pct = Math.round(frac * 100);
  return (
    <>
      <div className={styles.stops}>
        {rows.map((r) => {
          const first = r.index === 0;
          const last = r.index === n - 1;
          return (
            <div
              key={r.index}
              className={[
                styles.sp,
                r.status === "done"
                  ? styles.spDone
                  : r.status === "here"
                    ? styles.spHere
                    : styles.spPend,
                last ? styles.spLast : "",
                first ? styles.spFirst : ""
              ].join(" ")}
            >
              <span className={styles.pm} aria-hidden>
                {first ? "O" : last ? "D" : r.index}
              </span>
              <div className={styles.sn}>
                <div className={styles.snK}>{stopLabel(r.index, n)}</div>
                <div className={styles.snV}>{r.name}</div>
              </div>
              <div className={styles.sw}>
                <span className={`${styles.swPlan} ${styles.num}`}>Plan {sdt(r.plan)}</span>
                <StopReal row={r} n={n} item={item} t={t} params={params} />
              </div>
            </div>
          );
        })}
        <div className={`${styles.leg} ${styles[`lv_${e.level}`]}`}>
          <div
            className={styles.prog}
            role="progressbar"
            aria-label="Avance de la ruta"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
          >
            <i style={{ width: `${pct}%` }} />
          </div>
          <span className={styles.num}>
            {n > 2 ? `Tramo ${leg} de ${n - 1} · ` : ""}
            <b>{pct}%</b> · faltan {km.toLocaleString("es-CO")} km · {speed} km/h
          </span>
        </div>
      </div>
    </>
  );
}
