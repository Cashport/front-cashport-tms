import { VehicleRate } from "@/types/contracts/contractsTypes";
import { formatMoney } from "@/utils/utils";
import { Button, TableProps, Typography } from "antd";

import { Eye } from "phosphor-react";
const { Text } = Typography;

export const columns: TableProps<VehicleRate>["columns"] = [
  {
    title: "SAP Description",
    dataIndex: "sapDescription",
    key: "sapDescription",
    sorter: (a, b) => a.sapDescription.localeCompare(b.sapDescription),
    showSorterTooltip: false
  },
  {
    title: "Proveedor",
    dataIndex: "supplier",
    key: "supplier",
    sorter: (a, b) => a.supplier.localeCompare(b.supplier),
    showSorterTooltip: false
  },
  {
    title: "Vehículo",
    dataIndex: "vehicle",
    key: "vehicle",
    sorter: (a, b) => a.vehicle.localeCompare(b.vehicle),
    showSorterTooltip: false
  },
  {
    title: "UDM",
    dataIndex: "unitOfMeasurement",
    key: "unitOfMeasurement",
    sorter: (a, b) => a.unitOfMeasurement.localeCompare(b.unitOfMeasurement),
    showSorterTooltip: false
  },
  {
    title: "Desde",
    dataIndex: "from",
    key: "from",
    sorter: (a, b) => Number(a.from) - Number(b.from),
    showSorterTooltip: false
  },
  {
    title: "Hasta",
    dataIndex: "to",
    key: "to",
    sorter: (a, b) => Number(a.to) - Number(b.to),
    showSorterTooltip: false
  },
  {
    title: "Valor",
    dataIndex: "value",
    key: "value",
    render: (amount) => <Text>{formatMoney(amount)}</Text>,
    sorter: (a, b) => a.value - b.value,
    showSorterTooltip: false
  },
  {
    title: "Ubicación base",
    dataIndex: "baseCity",
    key: "baseCity",
    sorter: (a, b) => a.baseCity.localeCompare(b.baseCity),
    showSorterTooltip: false
  },
  {
    title: "",
    key: "buttonSee",
    width: "54px",
    render: (_, { id }) => (
      <Button
        onClick={() => console.log("ABRIR MODAL")}
        className="icon-detail"
        icon={<Eye size={20} />}
      />
    )
  }
];
