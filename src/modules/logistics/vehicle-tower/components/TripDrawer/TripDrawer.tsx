"use client";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "phosphor-react";
import { useVehicleTowerStore } from "../../store/useVehicleTowerStore";
import type { IFleetItem } from "../../types/vehicleTower";
import { AlertsSection } from "./AlertsSection";
import { ContactsSection } from "./ContactsSection";
import { pillText } from "./drawerModel";
import { StateTimeline } from "./StateTimeline";
import { TripSection } from "./TripSection";
import styles from "./TripDrawer.module.scss";

export interface ITripDrawerProps {
  item: IFleetItem;
  t: number;
  onClose: () => void;
  onOpenVehicle?: () => void;
  onOpenDriver?: () => void;
  onOpenItems?: () => void;
  onOpenObservations?: () => void;
  onOpenRules?: () => void;
  footer?: ReactNode;
}

const KEEP_FOCUS = '[role="listbox"], [role="combobox"], input, textarea, select';

export function TripDrawer({
  item,
  t,
  onClose,
  onOpenVehicle,
  onOpenDriver,
  onOpenRules,
  onOpenItems,
  onOpenObservations,
  footer
}: ITripDrawerProps) {
  const { trip, evaluation: e } = item;
  const params = useVehicleTowerStore((s) => s.params);
  const nowDate = useVehicleTowerStore((s) => s.now);
  const now = nowDate.getTime();
  const rootRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    if (!prev || !prev.closest(KEEP_FOCUS)) rootRef.current?.focus({ preventScroll: true });
    return () => {
      if (prev && prev !== document.body && document.contains(prev))
        prev.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [trip.tripId]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key !== "Escape" || ev.defaultPrevented) return;
      const target = ev.target as HTMLElement | null;
      if (target?.closest('[role="dialog"], .ant-select-dropdown')) return;
      // Con un modal abierto, Escape es del modal (aunque el foco se haya perdido al cambiar su contenido).
      const modalOpen = Array.from(document.querySelectorAll<HTMLElement>(".ant-modal-wrap")).some(
        (w) => w.style.display !== "none"
      );
      if (modalOpen) return;
      closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <aside
      ref={rootRef}
      className={styles.drawer}
      role="complementary"
      aria-label={`Ficha del servicio ${trip.vehicle.plate}`}
      tabIndex={-1}
    >
      <header className={styles.head}>
        <div className={styles.top}>
          <span className={`${styles.plate} ${styles.plateLg}`}>{trip.vehicle.plate}</span>
          <span className={`${styles.pill} ${styles[`p_${e.level}`]}`}>{pillText(e)}</span>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Cerrar ficha"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
        <div className={styles.headSub}>
          {trip.vehicle.type} · {trip.carrier.name} · Regional {trip.vp}
        </div>
      </header>
      <div ref={bodyRef} className={styles.body}>
        {trip.transferRequest && (
          <section className={styles.sec} aria-labelledby="vt-dw-state">
            <div className={styles.secHead}>
              <h3 id="vt-dw-state" className={styles.secTitle}>
                Estado del servicio
              </h3>
            </div>
            <StateTimeline item={item} t={t} params={params} />
          </section>
        )}
        <AlertsSection item={item} t={t} onOpenRules={onOpenRules} />
        <ContactsSection trip={trip} />
        <TripSection
          item={item}
          t={t}
          now={now}
          params={params}
          onOpenVehicle={onOpenVehicle}
          onOpenDriver={onOpenDriver}
          onOpenItems={onOpenItems}
          onOpenObservations={onOpenObservations}
        />
        <div className={styles.footer}>{footer}</div>
      </div>
    </aside>
  );
}
