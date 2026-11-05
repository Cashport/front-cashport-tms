"use client";
import { useMemo } from "react";
import { message } from "antd";
import { cop, dt } from "../../lib/time";
import type { IVehicleTowerFollowUpFile, IVehicleTowerTrip } from "../../types/vehicleTower";
import { buildLog, fileExt, fileKind, kb, TMS_STATE_KEY } from "./followUpModel";
import styles from "./FollowUp.module.scss";

export interface ITripLogProps {
  trip: IVehicleTowerTrip;
  t: number;
}

export function TripLog({ trip, t }: ITripLogProps) {
  const [api, holder] = message.useMessage();
  const entries = useMemo(() => buildLog(trip, t), [trip, t]);

  const fileCard = (f: IVehicleTowerFollowUpFile, i: number) => {
    const body = (
      <>
        <span className={`${styles.cfi} ${styles[`k_${fileKind(f.name)}`]}`}>
          {fileExt(f.name)}
        </span>
        <span className={styles.cfn}>{f.name}</span>
        <span className={styles.cfs}>{kb(f.sizeBytes)}</span>
      </>
    );
    return f.url ? (
      <a
        key={`${f.name}-${i}`}
        className={styles.cfile}
        href={f.url}
        target="_blank"
        rel="noopener noreferrer"
        title={`Abrir ${f.name}`}
      >
        {body}
      </a>
    ) : (
      <button
        key={`${f.name}-${i}`}
        type="button"
        className={styles.cfile}
        title={`Descargar ${f.name}`}
        onClick={() => api.info(`Descargando ${f.name}`)}
      >
        {body}
      </button>
    );
  };

  return (
    <section className={styles.sec} aria-labelledby="vt-dw-log">
      {holder}
      <div className={styles.secHead}>
        <h3 id="vt-dw-log" className={styles.secTitle}>
          Bitácora de seguimiento
        </h3>
      </div>
      <ul className={styles.tl}>
        {entries.map((x) => {
          const stateKey = x.state ? (TMS_STATE_KEY[x.state] ?? "sin") : null;
          const showChips = !!(x.state || x.outcome || x.amount || x.tag);
          return (
            <li key={x.id}>
              <span className={`${styles.dot} ${styles[`b_${x.kind}`]}`} />
              <div>
                <div className={`${styles.when} ${styles.num}`}>
                  {dt(x.at)} · {x.who}
                  {x.role && <span className={styles.role}>{x.role}</span>}
                </div>
                {showChips && (
                  <div className={styles.bchips}>
                    {x.tag && (
                      <span className={`${styles.btag} ${x.kind === "chg" ? styles.btag_chg : ""}`}>
                        {x.tag}
                      </span>
                    )}
                    {x.state && stateKey && (
                      <span className={`${styles.bst} ${styles[`st_${stateKey}`]}`}>
                        <i />
                        {x.state}
                      </span>
                    )}
                    {x.outcome && <span className={styles.bres}>{x.outcome}</span>}
                    {x.kind === "cost" ? (
                      <>
                        <span className={`${styles.bcost} ${styles.num}`}>
                          {cop(x.amount ?? 0)}
                        </span>
                        <span
                          className={`${styles.bap} ${x.approved ? styles.bap_ok : styles.bap_pen}`}
                        >
                          {x.approved ? "Aprobado" : "Pendiente de aprobación"}
                        </span>
                      </>
                    ) : (
                      !!x.amount && (
                        <span className={`${styles.bres} ${styles.num}`}>{cop(x.amount)}</span>
                      )
                    )}
                  </div>
                )}
                <div className={styles.text}>{x.text}</div>
                {!!x.files?.length && <div className={styles.att2}>{x.files.map(fileCard)}</div>}
              </div>
            </li>
          );
        })}
        {!entries.length && (
          <li>
            <span className={styles.dot} />
            <div className={`${styles.text} ${styles.sub}`}>Sin eventos registrados.</div>
          </li>
        )}
      </ul>
    </section>
  );
}
