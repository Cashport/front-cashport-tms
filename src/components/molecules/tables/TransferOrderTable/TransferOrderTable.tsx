import { Table } from "antd";
import {
  ITransferRequest,
  ITransferRequestResponse
} from "@/types/transferRequest/ITransferRequest";
import { FC, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { columns } from "./columns/TOColumns";
import { IPagination } from "@/types/clients/IViewClientsTable";
dayjs.extend(utc);

export interface DataType {
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
}

interface ITransferOrdersTable {
  items: ITransferRequest[];
  pagination: IPagination;
  showColumn?: boolean;
  aditionalRow?: any;
  redirect?: string;
  showBothIds?: boolean;
  trShouldRedirect?: boolean;
  fetchData: (newPage: any, rowsPerPage: any) => Promise<ITransferRequestResponse[]>;
}

export const TransferOrdersTable: FC<ITransferOrdersTable> = ({
  items,
  pagination,
  showColumn = true,
  aditionalRow,
  redirect,
  showBothIds = false,
  trShouldRedirect = false,
  fetchData
}) => {
  const [currentPage, setCurrentPage] = useState<number>(pagination?.actualPage || 1);
  const [pageSize, setPageSize] = useState<number>(pagination?.rowsperpage || 10);

  const handleTableChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
    fetchData(page, pageSize);
  };

  let data: DataType[] = [];
  if (items) {
    data = items.map((item, index) => {
      return {
        key: index,
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
        }
      };
    });
  }
  const columnsShow = columns(showColumn, redirect, showBothIds, trShouldRedirect);
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
      dataSource={data}
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: pagination?.totalRows,
        onChange: handleTableChange,
        showSizeChanger: true
      }}
    />
  );
};
