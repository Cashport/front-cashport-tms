import { Typography } from "antd";
import Link from "next/link";
import styles from "./ModalHeader.module.scss"; // Ajusta la ruta según tu estructura
import { VehicleTracking } from "@/types/logistics/tracking/tracking";

const { Text } = Typography;

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
  const getState = (stateId: string) => {
    let state = transferOrderStates.find((f) => f.id === stateId);
    if (!state) {
      state = transferOrderStates.find((f) => f.id === defaultStateId);
    }

    return state ? (
      <div className={styles.trackStateContainer}>
        <Text className={styles.trackState} style={{ backgroundColor: state.bgColor }}>
          {state.name}
        </Text>
      </div>
    ) : null;
  };
  if (!vehicle) return <></>;
  return (
    <div className={styles.currentTrip}>
      <div>
        <Text className={styles.title}>Proveedor </Text>
        <Text className={styles.Info} strong>
          {vehicle.provider ?? ""}
        </Text>
        <br />
        <Text className={styles.title}>Tarifa </Text>
        <Text className={styles.Info} strong>
          {vehicle.fee_description ?? ""}
        </Text>
        <br />
        <Text className={styles.title}>Vehículo </Text>
        <Link
          href={`/logistics/providers/${vehicle.id_provider}/vehicle/${vehicle.id_vehicle}`}
          target="_blank"
          className={styles.link}
        >
          {vehicle.vehicle_type ?? ""}
        </Link>
        <br />
        <Text className={styles.title}>Conductor </Text>
        <Link
          href={`/logistics/providers/${vehicle.id_provider}/driver/${vehicle.driver_id}`}
          target="_blank"
          className={styles.link}
        >
          {vehicle.driver_name ?? ""} - {vehicle.driver_phone ?? ""}
        </Link>
      </div>
      {showState && getState(vehicle.state_id ?? "")}
    </div>
  );
};

export default ModalHeader;
