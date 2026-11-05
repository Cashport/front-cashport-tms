"use client";
import type { MapThemeMode } from "@/theme/mapPalette";
import { ContactRow } from "../TripDrawer/ContactsSection";
import drawer from "../TripDrawer/TripDrawer.module.scss";
import type { IVehicleTowerTrip } from "../../types/vehicleTower";
import { VtModal } from "./VtModal";
import styles from "./Modals.module.scss";

export const tons = (x: number): string =>
  x.toLocaleString("es-CO", { maximumFractionDigits: 1 }) + " t";

interface ITripItemsModalProps {
  open: boolean;
  onClose: () => void;
  mode: MapThemeMode;
  trip: IVehicleTowerTrip;
}

export function TripItemsModal({ open, onClose, mode, trip }: ITripItemsModalProps) {
  const trId = trip.transferRequest?.id ?? "";
  const personal = trip.vehicle.serviceType === "Personal";
  const items = trip.materials;
  const total = items.reduce((m, x) => m + x.weightTons, 0);
  return (
    <VtModal
      open={open}
      onClose={onClose}
      mode={mode}
      title={`${personal ? "Personal" : "Carga"} · ${trId}`}
    >
      {personal ? (
        <>
          <div className={drawer.contact}>
            {trip.passengers.map((p, i) => (
              <ContactRow key={`${p.name}-${i}`} role={p.psl} name={p.name} phone={p.phone} />
            ))}
          </div>
          <div className={styles.sub}>{trip.passengers.length} pasajeros</div>
        </>
      ) : (
        <table className={styles.ptab}>
          <colgroup>
            <col style={{ width: "30%" }} />
            <col />
            <col style={{ width: "22%" }} />
            <col style={{ width: "16%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Código</th>
              <th>Descripción</th>
              <th className={styles.r}>Cantidad</th>
              <th className={styles.r}>Peso</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x.code}>
                <td className={styles.mono}>{x.code}</td>
                <td>{x.description}</td>
                <td className={`${styles.r} ${styles.num}`}>
                  {x.quantity} {x.unit}
                </td>
                <td className={`${styles.r} ${styles.num}`}>{tons(x.weightTons)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>{items.length} ítems</td>
              <td className={`${styles.r} ${styles.num}`}>{tons(total)}</td>
            </tr>
          </tfoot>
        </table>
      )}
    </VtModal>
  );
}
