import { Table } from "antd";
import { ITransferRequest } from "@/types/transferRequest/ITransferRequest";
import { FC, useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { columns } from "./columns/TOColumns";
import { IPagination } from "@/types/clients/IViewClientsTable";
dayjs.extend(utc);

export interface DataTypeForTransferOrderTable {
  key: number;
  tr: string;
  id_transfer_request?: number;
  validator: {
    ismaterialsproblem: boolean;
    ispeopleproblem: boolean;
    tr: string;
  };
  origendestino: {
    origin: string;
    destination: string;
  };
  fechas: {
    origin: Date;
    destination: Date;
  };
  tipodeviaje: string;
  tiempodeviaje: string;
  valor: number;
  carriers: string;
  statusId: string;
  TOs?: string;
}

interface ITransferOrdersTable {
  items: ITransferRequest[];
  pagination: IPagination;
  showColumn?: boolean;
  aditionalRow?: {
    title: string;
    dataIndex: string;
    width: number;
    render: (_: any, row: DataTypeForTransferOrderTable) => JSX.Element;
  };
  redirect?: string;
  showBothIds?: boolean;
  trShouldRedirect?: boolean;
  showCarriersColumn?: boolean;
  fetchData: (newPage: number) => Promise<void>;
  loading: boolean;
}

export const TransferOrdersTable: FC<ITransferOrdersTable> = ({
  items,
  pagination,
  showColumn = true,
  aditionalRow,
  redirect,
  showBothIds = false,
  trShouldRedirect = false,
  showCarriersColumn = false,
  fetchData,
  loading
}) => {
  const [currentPage, setCurrentPage] = useState<number>(pagination?.actualPage || 1);

  const handleTableChange = (page: number) => {
    setCurrentPage(page);
    fetchData(page);
  };

  const [dataSource, setDataSource] = useState<DataTypeForTransferOrderTable[]>([]);

  useEffect(() => {
    const mappedData = items.map((item) => ({
      key: item.id,
      tr: String(item.id),
      origendestino: {
        origin: item.start_location,
        destination: item.end_location
      },
      fechas: {
        origin: item.start_date,
        destination: item.end_date
      },
      tipodeviaje: item.type,
      id_transfer_request: item.id_transfer_request ?? undefined,
      tiempodeviaje: String(item.created_at),
      valor: item?.total_value ?? 0,
      validator: {
        ismaterialsproblem: item.is_materials_problem,
        ispeopleproblem: item.is_people_problem,
        isRejected: !!item.is_rejected,
        tr: String(item.id)
      },
      carriers: item.carriers ?? "",
      statusId: item.statusId,
      TOs: item?.TOs
    }));
    setDataSource(mappedData);
  }, [items]);

  const columnsShow = columns(
    showColumn,
    redirect,
    showBothIds,
    trShouldRedirect,
    showCarriersColumn
  );
  if (aditionalRow) {
    columnsShow.unshift(aditionalRow);
  }

  return (
    <Table
      rowSelection={
        !aditionalRow
          ? {
              type: "checkbox"
            }
          : undefined
      }
      columns={columnsShow}
      dataSource={dataSource}
      pagination={{
        current: currentPage,
        pageSize: 10,
        total: pagination?.totalRows,
        onChange: handleTableChange,
        showSizeChanger: false
      }}
      loading={loading}
    />
  );
};
