import { IRequirement } from "@/types/transferJourney/ITransferJourney";
import styles from "./RequirementHeader.module.scss";
import { Typography } from "antd";
import { formatMoney } from "@/utils/utils";

const { Text } = Typography;

export const RequirementHeader = ({
  requirement,
  isHeader = false
}: {
  requirement: IRequirement;
  isHeader?: boolean;
}) => (
  <div className={`${styles.resumContainer} ${isHeader && styles.marginBottom}`}>
    <div className={styles.resum}>
      <div className={styles.resumItem}>
        <Text className={styles.text}>Servicio</Text>
        <Text
          className={`${styles.text} ${styles.bold}`}
        >{`${requirement.description} (${requirement.units} unds.)`}</Text>
      </div>
      <div className={styles.resumItem}>
        <Text className={styles.text}>Proveedor</Text>
        <Text className={`${styles.text} ${styles.bold}`}>{requirement.provider}</Text>
      </div>
    </div>
    <div className={`${styles.resum} ${styles.right}`}>
      <div className={`${styles.resumItem} ${styles.right}`}>
        <Text className={styles.text}>Tarifa base</Text>
        <Text className={styles.text}>{formatMoney(requirement.fare) || 0}</Text>
      </div>
      <div className={`${styles.resumItem} ${styles.right}`}>
        <Text className={`${styles.text} ${styles.bold}`}>Total</Text>
        <Text className={`${styles.text} ${styles.bold}`}>
          {formatMoney(requirement.total) || 0}
        </Text>
      </div>
    </div>
  </div>
);
