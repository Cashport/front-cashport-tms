import { ITripJourney } from "@/types/transferJourney/ITransferJourney";
import styles from "./TripHeader.module.scss";
import { Flex, Tag, Typography } from "antd";
import { formatMoney } from "@/utils/utils";

const { Text } = Typography;

export const TripHeader = ({
  trip,
  isHeader = false
}: {
  trip: ITripJourney;
  isHeader?: boolean;
}) => (
  <div className={`${styles.resumContainer} ${isHeader && styles.marginBottom}`}>
    <div className={styles.resum}>
      <div className={styles.resumItem}>
        <Text className={styles.text}>Vehículo</Text>
        <Text className={`${styles.text} ${styles.bold}`}>
          {trip.vehicle_type && (
            <>
              <Text ellipsis>{trip.vehicle_type}</Text>
              <span> / </span>
            </>
          )}
          <Text ellipsis>{trip.plate_number}</Text>
        </Text>
        <Flex style={{ marginLeft: "auto" }}>
          <Tag color={trip.trip_status_color}>{trip.trip_status}</Tag>
        </Flex>
      </div>
      <div className={styles.resumItem}>
        <Text className={styles.text}>Proveedor</Text>
        <Text className={`${styles.text} ${styles.bold}`}>{trip.provider}</Text>
      </div>
      <div className={styles.resumItem}>
        <Text className={styles.text}>Conductor</Text>
        <Text className={`${styles.text} ${styles.bold}`}>{trip.description}</Text>
      </div>
    </div>
    <div className={`${styles.resum} ${styles.right}`}>
      <div className={`${styles.resumItem} ${styles.right}`}>
        <Text className={styles.text}>Tarifa base</Text>
        <Text className={styles.text}>{formatMoney(trip.fare) || 0}</Text>
      </div>
      <div className={`${styles.resumItem} ${styles.right}`}>
        <Text className={styles.text}>Sobrecosto</Text>
        <Text className={styles.text}>{formatMoney(trip.surcharge) || 0}</Text>
      </div>
      <div className={`${styles.resumItem} ${styles.right}`}>
        <Text className={`${styles.text} ${styles.bold}`}>Total</Text>
        <Text className={`${styles.text} ${styles.bold}`}>{formatMoney(trip.total) || 0}</Text>
      </div>
    </div>
  </div>
);
