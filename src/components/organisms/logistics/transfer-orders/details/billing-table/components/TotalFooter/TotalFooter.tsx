import { formatNumber } from "@/utils/utils";
import { Col, Flex } from "antd";
import styles from "./TotalFooter.module.scss";
import { BillingByCarrier } from "@/types/logistics/billing/billing";

interface ITableFooter {
  supplierBillings: BillingByCarrier[];
}
const TotalFooter = ({ supplierBillings }: ITableFooter) => {
  const totalValue = supplierBillings.reduce((sum, billing) => sum + billing.subtotal, 0);
  const formatedTotalValue = formatNumber(totalValue, 2);

  return (
    <Flex justify="flex-end">
      <Col span={20} />
      <Col span={4}>
        <Flex style={{ background: "#F7F7F7", padding: 16 }}>
          <Flex align="center" gap={8}>
            <p className={styles.textFooter}>Total</p>
            <p className={styles.textFooter}>
              <b>${formatedTotalValue}</b>
            </p>
          </Flex>
        </Flex>
      </Col>
    </Flex>
  );
};

export default TotalFooter;
