"use client";
import type { MapThemeMode } from "@/theme/mapPalette";
import type { IVehicleTowerTrip } from "../../types/vehicleTower";
import { VtModal } from "./VtModal";
import styles from "./Modals.module.scss";

interface IObservationsModalProps {
  open: boolean;
  onClose: () => void;
  mode: MapThemeMode;
  trip: IVehicleTowerTrip;
}

export function ObservationsModal({ open, onClose, mode, trip }: IObservationsModalProps) {
  const tr = trip.transferRequest;
  return (
    <VtModal open={open} onClose={onClose} mode={mode} title={`Observaciones · ${tr?.id ?? ""}`}>
      <div className={styles.otxFull}>{tr?.observations}</div>
      {trip.requester && (
        <div className={styles.sub}>
          Registradas por {trip.requester.name} al crear la solicitud.
        </div>
      )}
    </VtModal>
  );
}
