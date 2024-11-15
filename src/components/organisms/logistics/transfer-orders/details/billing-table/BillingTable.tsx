import { Button, Table, Typography } from "antd";
import type { TableColumnsType } from "antd";
import { Eye } from "phosphor-react";
import { FC } from "react";
import styles from "./BillingTable.module.scss";
import { formatNumber } from "@/utils/utils";
import TotalFooter from "./components/TotalFooter/TotalFooter";
import { BillingByCarrier, BillingStatusEnum } from "@/types/logistics/billing/billing";
import { STATUS } from "@/utils/constants/globalConstants";
import BillingStatus from "./components/BillingStatus/BillingStatus";
const { Text } = Typography;

interface IBillingTableProps {
  supplierBillings: BillingByCarrier[];
  handleShowDetails: (id: number) => void;
}

export const BillingTable: FC<IBillingTableProps> = ({ supplierBillings, handleShowDetails }) => {
  const columns: TableColumnsType<BillingByCarrier> = [
    {
      title: "Nombre",
      dataIndex: "carrier",
      render: (text: string) => <Text className={styles.rowtext}>{text}</Text>
    },
    {
      title: "Estado",
      dataIndex: "statusDesc",
      render: (text: BillingStatusEnum, record: BillingByCarrier) => (
        <BillingStatus status={text} tooltipText={record.rejectObservation} />
      ),
      align: "center"
    },
    {
      title: "Vehículos",
      dataIndex: "vehicle_quantity",
      render: (value: number) => <Text className={styles.rowtext}>{value}</Text>,
      align: "right"
    },
    {
      title: "Tarifa base",
      dataIndex: "fare",
      render: (value: number) => <Text className={styles.rowtext}>${formatNumber(value, 2)}</Text>,
      align: "right"
    },
    {
      title: "Sobre costos",
      dataIndex: "overcost",
      render: (value: number) => <Text className={styles.rowtext}>${formatNumber(value, 2)}</Text>,
      align: "right"
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      render: (value: number) => <Text className={styles.rowtext}>${formatNumber(value, 2)}</Text>,
      align: "right"
    },
    {
      title: "",
      dataIndex: "id",
      render: (id, record) => (
        <div className={styles.btnContainer}>
          <Button
            className={styles.btn}
            type="text"
            size="middle"
            onClick={() => handleShowDetails(id)}
            icon={<Eye size={24} />}
            disabled={![STATUS.BNG.FACTURADO, STATUS.BNG.PREAUTORIZADO].includes(record.idStatus)}
          />
        </div>
      )
    }
  ];
  return (
    <Table
      columns={columns}
      pagination={false}
      dataSource={supplierBillings}
      footer={() => <TotalFooter supplierBillings={supplierBillings} />}
    />
  );
};
