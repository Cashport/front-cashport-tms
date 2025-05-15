import Link from "next/link";
import { VehicleTracking } from "@/types/logistics/tracking/tracking";

import styles from "./ModalHeader.module.scss";

interface TransferOrderState {
  id: string;
  name: string;
  bgColor: string;
}

interface ModalHeaderProps {
  vehicle: VehicleTracking | null;
  transferOrderStates: TransferOrderState[];
  defaultStateId: string;
  showState?: boolean;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({
  vehicle,
  transferOrderStates,
  defaultStateId,
  showState = true
}) => {
  const getState = (vehicle: VehicleTracking) => {
    let state = transferOrderStates.find((f) => f.id === vehicle.state_id);
    if (!state) {
      state = transferOrderStates.find((f) => f.id === defaultStateId);
    }

    return state ? (
      <div className={styles.trackStateContainer}>
        <p className={styles.trackState} style={{ backgroundColor: state.bgColor }}>
          {vehicle.trip_status ?? state.name}
        </p>
      </div>
    ) : null;
  };
  if (!vehicle) return <></>;
  return (
    <div className={styles.currentTrip}>
      <div className={styles.currentTrip__container}>
        <p className={styles.title}>Proveedor </p>
        <p className={styles.Info}>{vehicle.provider ?? ""}</p>
        <p className={styles.title}>Tarifa </p>
        <p className={styles.Info}>{vehicle.fee_description ?? ""}</p>
        <p className={styles.title}>Vehículo </p>
        <Link
          href={`/logistics/providers/${vehicle.id_provider}/vehicle/${vehicle.id_vehicle}`}
          target="_blank"
          className={styles.link}
        >
          {vehicle.vehicle_type ?? ""}
        </Link>
        <p className={styles.title}>Conductor </p>
        <Link
          href={`/logistics/providers/${vehicle.id_provider}/driver/${vehicle.driver_id}`}
          target="_blank"
          className={styles.link}
        >
          {vehicle.driver_name ?? ""} - {vehicle.driver_phone ?? ""}
        </Link>
      </div>
      {showState && getState(vehicle)}
    </div>
  );
};

export default ModalHeader;
