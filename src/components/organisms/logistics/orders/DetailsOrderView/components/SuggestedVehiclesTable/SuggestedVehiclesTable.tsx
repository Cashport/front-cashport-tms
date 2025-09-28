"use client";
import { Table, TableProps, Typography } from "antd";
import { ITransferOrderVehicle } from "@/types/logistics/schema";
import { OccupationPercentageBar } from "../OccupationPercentageBar";

const { Text } = Typography;

interface SuggestedVehiclesTableProps {
  vehicles?: ITransferOrderVehicle[];
}

export default function SuggestedVehiclesTable({
  vehicles
}: Readonly<SuggestedVehiclesTableProps>) {
  const columns: TableProps<ITransferOrderVehicle>["columns"] = [
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
      render: (text) => <Text>{text}</Text>,
      width: 60,
      align: "center"
    },
    {
      title: "Vehículo",
      dataIndex: "vehicle_type_desc",
      key: "vehicle_type_desc",
      render: (text) => <Text>{text}</Text>,
      align: "left"
    },
    {
      title: "Peso",
      key: "ocupation_kg",
      dataIndex: "ocupation_kg",
      render: (amount) => <OccupationPercentageBar percentage={amount} />,
      sorter: (a, b) => a.ocupation_kg - b.ocupation_kg,
      showSorterTooltip: false
    },

    {
      title: "Volumen",
      key: "ocupation_m3",
      dataIndex: "ocupation_m3",
      render: (amount) => <OccupationPercentageBar percentage={amount} />,
      sorter: (a, b) => a.ocupation_m3 - b.ocupation_m3,
      showSorterTooltip: false
    }
  ];

  return (
    <Table
      style={{ width: "100%" }}
      columns={columns}
      dataSource={vehicles}
      pagination={false}
      rowKey="id"
    />
  );
}
