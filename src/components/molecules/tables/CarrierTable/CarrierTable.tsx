"use client";
import { Dispatch, SetStateAction, useState } from "react";
import { formatMoney } from "@/utils/utils";
import { Eye, Warning } from "phosphor-react";
import { Button, Flex, Table, TableProps, Typography } from "antd";
import { Radioactive } from "@phosphor-icons/react";
import { ICarrierRequestsListDetail } from "@/types/logistics/schema";
import Link from "next/link";
import { useProjects } from "@/hooks/useProjects";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
const { Text } = Typography;

interface PropsCarrierTable {
  carrierData: ICarrierRequestsListDetail[];
  setSelectedRows: Dispatch<SetStateAction<any[] | undefined>>;
  loading: boolean;
}

export default function CarrierTable({
  carrierData: data,
  setSelectedRows,
  loading
}: PropsCarrierTable) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRow: any) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRow);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  const calculateMinutesDifference = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));

    return diffInMinutes;
  };

  const columns: TableProps<ICarrierRequestsListDetail>["columns"] = [
    {
      title: "TR",
      dataIndex: "id",
      key: "id",
      width: "6%",
      render: (id, record) => (
        <Link
          href={`/logistics/acept_carrier/${id}`}
          style={{ color: "blue", textDecorationLine: "none" }}
        >
          <Button type="link" style={{ padding: "0" }}>
            {`${record.id_transfer_request} - ${record.order_nro}`}
          </Button>
        </Link>
      ),
      sorter: (a, b) => a.id - b.id,
      showSorterTooltip: false
    },
    {
      title: "Origen y destino",
      dataIndex: ["start_location", "end_location"],
      key: "departureArrival",
      width: "25%",
      render: (text, record) => (
        <Text>
          <div>
            <strong>Origen</strong> {record.start_location}
          </div>
          <div>
            <strong>Destino</strong> {record.end_location}
          </div>
        </Text>
      ),
      sorter: (a, b) => a.start_location.localeCompare(b.start_location),
      showSorterTooltip: false
    },
    {
      title: "Fechas",
      key: "startEndDate",
      dataIndex: ["start_date", "end_date"],
      render: (text, record) => (
        <Text>
          {record.start_date} <br /> {record.end_date}
        </Text>
      ),
      sorter: (a, b) =>
        dayjs(a.start_date, "DD/MM/YYYY HH:mm").valueOf() -
        dayjs(b.start_date, "DD/MM/YYYY HH:mm").valueOf(),
      showSorterTooltip: false
    },
    {
      title: "Tipo de viaje",
      key: "travelType",
      dataIndex: "service_type",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.service_type.localeCompare(b.service_type),
      showSorterTooltip: false
    },
    {
      title: "Vehículo(s)",
      key: "vehicle",
      dataIndex: "vehicles",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.vehicles.localeCompare(b.vehicles),
      showSorterTooltip: false
    },
    {
      title: "Tiempo transcurido",
      key: "timeTraveled",
      dataIndex: "elapsedtime",
      render: (text) => <Text>{calculateMinutesDifference(text)} min</Text>,
      sorter: (a, b) =>
        calculateMinutesDifference(a.elapsedtime) - calculateMinutesDifference(b.elapsedtime),
      showSorterTooltip: false
    },
    {
      title: "Valor",
      key: "value",
      dataIndex: "amount",
      render: (amount) => <Text>{amount ? formatMoney(amount) : "$ 0"}</Text>,
      sorter: (a, b) => a.amount - b.amount,
      showSorterTooltip: false,
      align: "right"
    },
    {
      title: "",
      key: "buttonSee",
      width: 64,
      dataIndex: "id",
      render: (id) => (
        <Flex style={{ gap: "6px", justifyContent: "flex-end" }}>
          {/*{record.radioactiveIcon && (
            <Button style={{ backgroundColor: "#F7F7F7" }} icon={<Radioactive size={"1.3rem"} />} />
          )}*/}
          {/*{record.dangerIcon && (
            <Button style={{ backgroundColor: "#F7F7F7" }} icon={<Warning size={"1.3rem"} />} />
          )}*/}
          {/*{record.eyeIcon && (
            <Link href={`/aceptacion_de_proveedores/${id}`}><Button style={{ backgroundColor: "#F7F7F7" }} icon={<Eye size={"1.3rem"} />} /></Link>
          )}*/}
          <Link href={`/logistics/acept_carrier/${id}`}>
            <Button style={{ backgroundColor: "#F7F7F7" }} icon={<Eye size={"1.3rem"} />} />
          </Link>
        </Flex>
      )
    }
  ];

  return (
    <Table
      style={{ width: "100%" }}
      columns={columns}
      dataSource={data.map((data) => ({ ...data, key: data.id }))}
      rowSelection={rowSelection}
      rowClassName={(record) => (selectedRowKeys.includes(record.id) ? "selectedRow" : "")}
      pagination={false}
      loading={loading}
    />
  );
}
