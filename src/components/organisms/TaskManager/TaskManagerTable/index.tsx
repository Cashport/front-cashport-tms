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
    onChange: onSelectChange,
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
              textOverflow: "ellipsis",
            }}
          >
            {first}
          </span>
        </Tooltip>

        {remaining > 0 && (
          <Tooltip title={allNames}>
            <span
              className="text-sm font-bold cursor-pointer"
            >
              +{remaining}
            </span>
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
      sorter: (a, b) => a.autoId - b.autoId,
      showSorterTooltip: false,
    },
    {
      title: "TO",
      dataIndex: "to",
      key: "to",
      sorter: (a, b) => String(a.to).localeCompare(String(b.to)),
      showSorterTooltip: false,
    },
    {
      title: "TR",
      dataIndex: "tr",
      key: "tr",
      width: 130,
      sorter: (a, b) => a.tr - b.tr,
      showSorterTooltip: false,
    },
    {
      title: "Trayecto",
      key: "trayecto",
      width: 350,
      render: (_, row) => (
        <div>
          <div>
            Origen <b>{row.origen}</b>
          </div>
          <div>
            Destino <b>{row.destino}</b>
          </div>
        </div>
      ),
      sorter: (a, b) => a.trayecto.localeCompare(b.trayecto),
      showSorterTooltip: false,
    },
    {
      title: "Inicio del viaje",
      dataIndex: "fechaEntrega",
      key: "fechaEntrega",
      render: (value) => (value ? new Date(value).toLocaleDateString() : "-"),
      sorter: (a, b) => new Date(a.fechaEntrega ?? 0).getTime() - new Date(b.fechaEntrega ?? 0).getTime(),
      showSorterTooltip: false,
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
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
      ),
    },
    {
      title: "Proveedores",
      key: "proveedores",
      render: (_, row) => renderProveedores(row.proveedores),
    },
    {
      title: "Costo actual",
      dataIndex: "monto",
      key: "monto",
      align: "right",
      render: (value) => (
        <p className="fontMonoSpace" style={{ whiteSpace: "nowrap" }}>
          {formatMoney(value)}
        </p>
      ),
      sorter: (a, b) => a.monto - b.monto,
      showSorterTooltip: false,
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
      ),
    },
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
