import { Dispatch, SetStateAction, useState } from "react";
import { Button, Table, TableProps, Typography } from "antd";

import { Eye } from "phosphor-react";
import { formatDate, formatMoney } from "@/utils/utils";
import { IFinancialDiscount } from "@/types/financialDiscounts/IFinancialDiscounts";
import "./accounting-adjustments-table.scss";

const { Text } = Typography;

interface PropsInvoicesTable {
  dataAdjustmentsByStatus: IFinancialDiscount[];
  setSelectedRows: Dispatch<SetStateAction<IFinancialDiscount[] | undefined>>;
  setShowAdjustmentDetailModal: Dispatch<
    SetStateAction<{
      isOpen: boolean;
      adjustmentId: number;
    }>
  >;
  financialStatusId: number;
}

const AccountingAdjustmentsTable = ({
  dataAdjustmentsByStatus: data,
  setSelectedRows,
  setShowAdjustmentDetailModal,
  financialStatusId
}: PropsInvoicesTable) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const openAdjustmentDetail = (adjustmentId: number) => {
    setShowAdjustmentDetailModal({ isOpen: true, adjustmentId });
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRows: any) => {
    setSelectedRowKeys(newSelectedRowKeys);
    if (newSelectedRowKeys.length >= 1) {
      // set the selected Rows but adding to the previous selected rows
      setSelectedRows((prevSelectedRows) => {
        if (prevSelectedRows) {
          //check if the new selected rows are already in the selected rows
          const filteredSelectedRows = newSelectedRows.filter(
            (newSelectedRow: IFinancialDiscount) =>
              !prevSelectedRows.some((prevSelectedRow) => prevSelectedRow.id === newSelectedRow.id)
          );

          //filters the unselected rows but only the ones that have the status_id equal to financialStatusId
          const unCheckedRows = prevSelectedRows?.filter(
            (prevSelectedRow) =>
              !newSelectedRowKeys.includes(prevSelectedRow.id) &&
              prevSelectedRow.financial_status_id === financialStatusId
          );
          if (unCheckedRows.length > 0) {
            // remove form the prevState the ones present in the unCheckedRows
            const filteredPrevSelectedRows = prevSelectedRows.filter(
              (prevSelectedRow) => !unCheckedRows.includes(prevSelectedRow)
            );
            return filteredPrevSelectedRows;
          }

          return [...prevSelectedRows, ...filteredSelectedRows];
        } else {
          return newSelectedRows;
        }
      });
    }
    //traverse the alreadySelectedRows and remove the ones that have the status_id of the financialStatusId
    if (newSelectedRowKeys.length === 0) {
      setSelectedRows((prevSelectedRows) => {
        if (prevSelectedRows) {
          return prevSelectedRows.filter(
            (prevSelectedRow) => prevSelectedRow.financial_status_id !== financialStatusId
          );
        }
      });
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  const columns: TableProps<IFinancialDiscount>["columns"] = [
    {
      title: "ID ERP",
      dataIndex: "id",
      key: "id",
      render: (invoiceId) => (
        <p onClick={() => openAdjustmentDetail(invoiceId)} className="adjustmentsTable__id">
          {invoiceId}
        </p>
      ),
      sorter: (a, b) => a.id - b.id,
      showSorterTooltip: false,
      width: 130
    },
    {
      title: "Creación",
      dataIndex: "create_at",
      key: "create_at",
      render: (text) => <Text className="cell -alignRight">{formatDate(text)}</Text>,
      sorter: (a, b) => Date.parse(a.create_at) - Date.parse(b.create_at),
      align: "center",
      width: 80,
      showSorterTooltip: false
    },
    {
      title: "Monto Inicial",
      key: "initial_value",
      dataIndex: "initial_value",
      render: (text) => <Text className="cell -alignRight">{formatMoney(text)}</Text>,
      align: "right",
      sorter: (a, b) => a.initial_value - b.initial_value,
      showSorterTooltip: false
    },
    {
      title: "Monto aplicado",
      key: "missing",
      dataIndex: "missing",
      render: (text) => <Text className="cell -alignRight">{text}</Text>,
      align: "right",
      sorter: (a, b) => a.initial_value - b.initial_value,
      showSorterTooltip: false
    },
    {
      title: "Monto disponible",
      key: "current_value",
      dataIndex: "current_value",
      render: (amount) => <Text className="cell -alignRight">{formatMoney(amount)}</Text>,
      align: "right",
      sorter: (a, b) => a.current_value - b.current_value,
      showSorterTooltip: false
    },
    {
      title: "",
      render: (_, record) => (
        <Button onClick={() => openAdjustmentDetail(record.id)} icon={<Eye size={"1.2rem"} />} />
      ),
      width: 60,
      onCell: () => ({
        style: {
          flex: 2
        }
      })
    }
  ];

  return (
    <>
      <Table
        className="adjustmentsTable"
        columns={columns}
        dataSource={data?.map((data) => ({ ...data, key: data.id }))}
        rowSelection={rowSelection}
        rowClassName={(record) => (selectedRowKeys.includes(record.id) ? "selectedRow" : "")}
        pagination={false}
      />
    </>
  );
};

export default AccountingAdjustmentsTable;
