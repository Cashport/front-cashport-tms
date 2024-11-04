import { Button, TableProps } from "antd";
import { VehicleRate } from "./VehiclesRatesTable";
import { Eye } from "phosphor-react";

export const columns: TableProps<VehicleRate>["columns"] = [
  {
    title: "SAP Description",
    dataIndex: "sapDescription",
    key: "sapDescription"
  },
  {
    title: "Proveedor",
    dataIndex: "provider",
    key: "provider"
  },
  {
    title: "Vehículo",
    dataIndex: "vehicle",
    key: "vehicle"
  },
  {
    title: "UDM",
    dataIndex: "rateType",
    key: "rateType"
  },
  {
    title: "Desde",
    dataIndex: "from",
    key: "from"
  },
  {
    title: "Hasta",
    dataIndex: "to",
    key: "to "
  },
  {
    title: "Valor",
    dataIndex: "value",
    key: "value "
  },
  {
    title: "Ubicación base",
    dataIndex: "originLocation",
    key: "originLocation "
  },
  {
    title: "",
    key: "buttonSee",
    width: "54px",
    render: (_, { vehicleRateId }) => (
      <Button
        onClick={() => console.log("ABRIR MODAL")}
        className="icon-detail"
        icon={<Eye size={20} />}
      />
    )
  }
];
