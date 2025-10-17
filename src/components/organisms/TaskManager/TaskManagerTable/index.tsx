import React, { ReactNode, Dispatch, SetStateAction } from "react";
import { Table, Flex, Button, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Tag } from "@/components/atoms/Tag/Tag";
import { Circle, Eye } from "phosphor-react";

import { useAppStore } from "@/lib/store/store";
import useScreenHeight from "@/components/hooks/useScreenHeight";

import { ITask } from "@/types/tasks/ITasks";

import "./taskManagerTable.scss";
import { useRouter } from "next/navigation";

const TaskTable: React.FC<{
  data: ITask[];
  setSelectedRows: Dispatch<SetStateAction<ITask[] | undefined>>;
}> = ({ data, setSelectedRows }) => {
  const router = useRouter();
  const formatMoney = useAppStore((state) => state.formatMoney);
  const height = useScreenHeight();

  const onSelectChange = (_newSelectedRowKeys: React.Key[], newSelectedRow: any) => {
    setSelectedRows(newSelectedRow);
  };

  const rowSelection = {
    columnWidth: 30,
    onChange: onSelectChange
  };

  const renderProveedores = (proveedores?: string[]) => {
    if (!proveedores || proveedores.length === 0) return "-";

    const first = proveedores[0];
    const remaining = proveedores.length - 1;
    const allNames = proveedores.join(", ");

    return (
      <Flex gap="0.25rem" align="center">
        <Tooltip title={first}>
          <span
            className="truncate"
            style={{
              maxWidth: "150px",
              display: "inline-block",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {first}
          </span>
        </Tooltip>

        {remaining > 0 && (
          <Tooltip title={allNames}>
            <span className="text-sm font-bold cursor-pointer">+{remaining}</span>
          </Tooltip>
        )}
      </Flex>
    );
  };

  const columns: ColumnsType<ITask> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
      showSorterTooltip: false,
      width: 80
    },
    {
      title: "TO",
      dataIndex: "transfer_order_ids",
      key: "transfer_order_ids",
      sorter: (a, b) => String(a.transfer_order_ids).localeCompare(String(b.transfer_order_ids)),
      showSorterTooltip: false,
      width: 130
    },
    {
      title: "TR",
      dataIndex: "transfer_request_id",
      key: "transfer_request_id",
      width: 100,
      sorter: (a, b) => a.transfer_request_id - b.transfer_request_id,
      showSorterTooltip: false,
    },
    {
      title: "Trayecto",
      key: "trayecto",
      width: 350,
      render: (_, row) => (
        <div>
          <div>
            Origen <b>{row.start_location_name}</b>
          </div>
          <div>
            Destino <b>{row.end_location_name}</b>
          </div>
        </div>
      ),
      sorter: (a, b) => a.start_location_name.localeCompare(b.start_location_name),
      showSorterTooltip: false
    },
    {
      title: "Inicio del viaje",
      dataIndex: "start_date",
      key: "start_date",
      render: (_, row) => (
        <div>
          Inicio: <b>{row.start_date}</b>
          <br />
          Fin: <b>{row.end_date}</b>
        </div>
      ),
      width: 250,
      sorter: (a, b) =>
        new Date(a.start_date ?? 0).getTime() - new Date(b.start_date ?? 0).getTime(),
      showSorterTooltip: false
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: ITask["status"]) => (
        <Flex>
          <Tag
            icon={<Circle color={status.color} weight="fill" size={6} />}
            content={status.name}
            style={{ backgroundColor: status.backgroundColor, textWrap: "nowrap" }}
            color={status.color}
            withBorder={false}
          />
        </Flex>
      )
    },
    {
      title: "Proveedores",
      key: "carriers",
      render: (_, row) => renderProveedores(row.carriers),
      width: 170
    },
    {
      title: "Costo actual",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      width: 150,
      render: (value) => (
        <p className="fontMonoSpace" style={{ whiteSpace: "nowrap" }}>
          {formatMoney(value)}
        </p>
      ),
      sorter: (a, b) => (a.amount ?? 0) - (b.amount ?? 0),
      showSorterTooltip: false
    },
    {
      title: "",
      key: "action",
      fixed: "right",
      width: 100,
      render: (_, row) => (
        <Flex justify="end" gap="0.5rem">
          <Button
            type="text"
            className="rounded-md border border-gray-300 hover:bg-gray-100 bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/gestor-tareas/${row.id}`);
            }}
          >
            <Eye size={18} color="#555" />
          </Button>
        </Flex>
      )
    }
  ];

  return (
    <Table
      className="taskManagerTable"
      columns={columns}
      dataSource={data?.map((task) => ({ ...task, key: task.id }))}
      rowSelection={rowSelection}
      pagination={false}
      scroll={{ y: (height ?? 800) - 270, x: 100 }}
    />
  );
};

export default TaskTable;
