"use client";
import type { MapThemeMode } from "@/theme/mapPalette";
import { ALERTAS } from "../../lib/rules";
import { VtModal } from "./VtModal";
import styles from "./Modals.module.scss";

interface IRulesModalProps {
  open: boolean;
  onClose: () => void;
  mode: MapThemeMode;
}

export function RulesModal({ open, onClose, mode }: IRulesModalProps) {
  const order = Object.entries(ALERTAS).sort((a, b) => b[1].pri - a[1].pri);
  return (
    <VtModal open={open} onClose={onClose} mode={mode} title="Reglas de alertas">
      <p className={styles.sub} style={{ margin: 0 }}>
        Se evalúan en cada corte (cada 15 min). Si un viaje tiene varias alertas activas, manda la
        de mayor prioridad (1 es la más crítica): define el color del punto en el mapa, la fila de
        la lista y el primer renglón de Estado del servicio. Las demás quedan como eventos.
      </p>
      <div className={styles.rules}>
        {order.map(([code, a], i) => (
          <div key={code} className={styles.rl}>
            <span className={`${styles.dot} ${styles[`d_${a.lvl}`]}`} aria-hidden />
            <div>
              <div className={styles.rn}>
                <span className={styles.prk}>{i + 1}</span>
                {a.name} <span className={styles.sub}>· {a.fase}</span>
              </div>
              <div className={styles.rr}>{a.rule}</div>
            </div>
          </div>
        ))}
      </div>
    </VtModal>
  );
}
