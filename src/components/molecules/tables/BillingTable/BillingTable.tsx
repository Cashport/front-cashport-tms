"use client";
import { Dispatch, SetStateAction, useState } from "react";
import { formatMoney } from "@/utils/utils";
import { Eye } from "phosphor-react";
import { Button, Flex, Table, TableProps, Typography } from "antd";

import Link from "next/link";
// import { useProjects } from "@/hooks/useProjects";
import {
  IBillingsRequestList,
  IBillingRequestsListDetail
} from "@/types/logistics/billing/billing";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "GMT"
  };
  return dayjs.utc(dateString).toDate().toLocaleDateString("es-ES", options).replace(",", "");
}

const { Text } = Typography;

interface PropsBillingTable {
  billingData: IBillingsRequestList;
  setSelectedRows: Dispatch<SetStateAction<any[] | undefined>>;
  loading: boolean;
  // eslint-disable-next-line no-unused-vars
  fetchData: (newPage: number) => Promise<void>;
}

export default function BillingTable({
  billingData: data,
  setSelectedRows,
  loading,
  fetchData
}: PropsBillingTable) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(data.page?.actualPage || 1);

  const handleTableChange = (page: number) => {
    setCurrentPage(page);
    fetchData(page);
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRow: any) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRow);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  const columns: TableProps<IBillingRequestsListDetail>["columns"] = [
    {
      title: "TR",
      dataIndex: "idTransferRequest",
      key: "idTransferRequest",
      render: (idTransferRequest, record) => (
        <Link
          href={`/facturacion/${record.id}`}
          style={{ color: "blue", textDecorationLine: "underline" }}
        >
          {idTransferRequest}
        </Link>
      ),
      sorter: (a, b) => a.idTransferRequest - b.idTransferRequest,
      showSorterTooltip: false
    },
    {
      title: "Origen y destino",
      dataIndex: ["start_location", "end_location"],
      key: "departureArrival",
      render: (text, record) => (
        <Text>
          <div>
            <strong>Origen</strong> {record.startLocation}
          </div>
          <div>
            <strong>Destino</strong> {record.endLocation}
          </div>
        </Text>
      ),
      sorter: (a, b) => a.startLocation.localeCompare(b.startLocation),
      showSorterTooltip: false
    },
    {
      title: "Fechas",
      key: "startEndDate",
      dataIndex: ["start_date", "end_date"],
      render: (text, record) => (
        <Text>
          {formatDate(record.startDate)} <br />
          {formatDate(record.endDate)}
        </Text>
      ),
      sorter: (a, b) => {
        if (new Date(a.startDate).getTime() === new Date(b.startDate).getTime()) {
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        }
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      },
      showSorterTooltip: false
    },
    {
      title: "Proveedor",
      key: "carrierName",
      dataIndex: "carrier",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.carrier.localeCompare(b.carrier),
      showSorterTooltip: false
    },
    {
      title: "Tipo de viaje",
      key: "travelType",
      dataIndex: "serviceTypes",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.serviceTypes.localeCompare(b.serviceTypes),
      showSorterTooltip: false
    },
    {
      title: "Valor final",
      key: "value",
      dataIndex: "fare",
      render: (fare) => <Text>{formatMoney(fare)}</Text>,
      sorter: (a, b) => a.fare - b.fare,
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
          <Link href={`/facturacion/${id}`}>
            <Button style={{ backgroundColor: "#F7F7F7" }} icon={<Eye size={"1.3rem"} />} />
          </Link>
        </Flex>
      )
    }
  ];

  return (
    <>
      <Table
        style={{ width: "100%" }}
        columns={columns}
        dataSource={data.billings.map((data) => ({ ...data, key: data.id }))}
        rowSelection={rowSelection}
        rowClassName={(record) => (selectedRowKeys.includes(record.id) ? "selectedRow" : "")}
        pagination={{
          current: currentPage,
          pageSize: data.page?.rowsperpage,
          total: data.page?.totalRows,
          onChange: handleTableChange,
          showSizeChanger: false
        }}
        loading={loading}
      />
    </>
  );
}
