import { Divider, Flex, Row } from "antd";
import styles from "./Responsibles.module.scss";
interface CostCenter {
  id: number;
  percentage: number;
  cost_center_desc: string;
}
export interface PSL {
  id: number;
  description: string;
  transfer_order_cost_center: CostCenter[];
}
interface ResponsiblesProps {
  title?: string;
  psls: PSL[];
  insideCollapse?: boolean;
}

export const sumCostCenterPercentages = (psl: PSL): number => {
  const totalPercentage = psl.transfer_order_cost_center.reduce(
    (sum, costCenter) => sum + costCenter.percentage,
    0
  );
  return totalPercentage;
};

export const Responsibles = ({ title, psls, insideCollapse = false }: ResponsiblesProps) => {
  return (
    <Flex vertical className={insideCollapse ? "" : styles.container}>
      {title && <p className={styles.sectionTitle}>{title}</p>}
      {psls?.map((psl, index) => (
        <Flex key={`psl-${index}-${psl.id}`} vertical>
          {index !== 0 && <Divider className={styles.divider} />}
          <Flex justify="space-between">
            <p className={styles.subtitleReg}>
              <strong>PSL: </strong>
              {psl.description}
            </p>
            <p className={styles.subtitle}>{sumCostCenterPercentages(psl)}% </p>
          </Flex>
          {psl?.transfer_order_cost_center?.map((cc, index) => (
            <Flex
              key={`cc-${index}-${cc.id}`}
              justify="space-between"
              style={{ marginTop: "0.5rem" }}
            >
              <p className={styles.subtitleReg} style={{ marginLeft: "1rem" }}>
                <strong>CC: </strong>
                {cc.cost_center_desc}
              </p>
              <p className={styles.bodyReg}>{cc.percentage}%</p>
            </Flex>
          ))}
        </Flex>
      ))}
    </Flex>
  );
};
