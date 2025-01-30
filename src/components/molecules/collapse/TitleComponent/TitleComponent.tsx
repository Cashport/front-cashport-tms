import { ITransferJourney } from "@/types/transferJourney/ITransferJourney";
import styles from "./TitleComponent.module.scss";
import { CaretDown, Truck } from "phosphor-react";
import { Typography } from "antd";
import { TripHeader } from "../TripHeader/TripHeader";
import { RequirementHeader } from "../Requirementheader/RequirementHeader";

const { Text } = Typography;

export const TitleComponent = ({
  journey,
  activeKey
}: {
  journey: ITransferJourney;
  activeKey: number | null;
}) => (
  <div className={styles.header}>
    <div className={styles.stateContainer}>
      <Truck size={27} color="#FFFFFF" weight="fill" />
      <Text className={styles.state}>{journey.description}</Text>
    </div>
    <div className={styles.fromto}>
      <div className={styles.fromtoContainer}>
        <Text className={styles.title}>Origen</Text>
        <Text className={styles.subtitle}>{journey.start_location}</Text>
      </div>
      <div className={`${styles.fromtoContainer} ${styles.right}`}>
        <div className={styles.fromtoContainer}>
          <Text className={styles.title}>Destino</Text>
          <Text className={styles.subtitle}>{journey.end_location}</Text>
        </div>
        <CaretDown
          className={`${styles.caret} ${journey.id === activeKey && styles.rotate}`}
          size={24}
        />
      </div>
    </div>
    {journey.id !== activeKey &&
      journey.trips.map((trip) => <TripHeader key={trip.id} isHeader trip={trip} />)}
    {journey.id !== activeKey &&
      journey.requirements.map((req) => (
        <RequirementHeader key={req.id} isHeader requirement={req} />
      ))}
  </div>
);
