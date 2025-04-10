import { Dispatch, SetStateAction } from "react";
import { Button, Select, Table, TableProps, Tooltip, Typography } from "antd";
import { CheckCircle, Eye } from "phosphor-react";
import "./concilationTable.scss";
import { formatDate, formatDateBars, formatMoney } from "@/utils/utils";
import { IInvoiceConcilation } from "@/types/concilation/concilation";
import { useInvoiceIncidentMotives } from "@/hooks/useInvoiceIncidentMotives";

const { Text } = Typography;

interface PropsInvoicesTable {
  dataSingleInvoice: IInvoiceConcilation[];
  setShowInvoiceDetailModal: Dispatch<
    SetStateAction<{
      isOpen: boolean;
      invoiceId: number;
    }>
  >;

  // eslint-disable-next-line no-unused-vars
  addSelectMotive: (invoiceId: number, motiveId: number) => void;
}

export const ConcilationTable = ({
  dataSingleInvoice: data,
  addSelectMotive,
  setShowInvoiceDetailModal
}: PropsInvoicesTable) => {
  const openInvoiceDetail = (invoiceId: number) => {
    setShowInvoiceDetailModal({ isOpen: true, invoiceId });
  };

  const { data: motives, isLoading } = useInvoiceIncidentMotives();
  const columns: TableProps<IInvoiceConcilation>["columns"] = [
    {
      title: "Factura",
      dataIndex: "id",
      key: "id",
      render: (invoiceId) => (
        <Text onClick={() => openInvoiceDetail(invoiceId)} className="invoicesTable__id">
          {invoiceId}
        </Text>
      ),
      sorter: (a, b) => a.id - b.id,
      showSorterTooltip: false
    },
    {
      title: "Fecha",
      dataIndex: "create_at",
      key: "create_at",
      render: (text) => <Text className="cell -alignRight">{formatDate(text)}</Text>,
      sorter: (a, b) => Number(a.create_at) - Number(b.create_at),
      showSorterTooltip: false,
      align: "right",
      width: 120
    },
    { 
      title: "Pronto pago",
      key: "earlypay_date",
      dataIndex: "earlypay_date",

      showSorterTooltip: false,
      align: "right",
      width: 150
    },
    {
      title: "Monto cp",
      key: "current_value",
      dataIndex: "current_value",
      render: (amount) => <Text className="cell -alignRight">{formatMoney(amount)}</Text>,
      showSorterTooltip: false,
      align: "right",
      width: 150
    },
    {
      title: "Observación",
      key: "observation",
      dataIndex: "observation",
      render: (text) => <Text className="cell -alignRight">{text}</Text>,
      sorter: (a, b) => a.current_value - b.current_value,
      showSorterTooltip: false,
      align: "left"
    },
    {
      title: "Diferencia",
      key: "difference_amount",
      dataIndex: "difference_amount",
      render: (amount) => (
        <p className="text__red__concilation">{amount > 0 ? formatMoney(amount) : ""}</p>
      ),
      sorter: (a, b) => a.current_value - b.current_value,
      showSorterTooltip: false,
      align: "right"
    },
    {
      title: "Acción",
      key: "motive_id",
      render: (_, record) => (
        <div className="actionWrapper">
          <Select
            placeholder="Seleccionar acción"
            loading={isLoading}
            options={motives?.map((motive) => ({ value: motive?.name, label: motive?.name })) || []}
            onChange={(value) =>
              addSelectMotive(record.id, motives?.find((motive) => motive.name === value)?.id || 0)
            }
            style={{ width: "100%" }}
          />
        </div>
      ),
      width: "17%",
      align: "center"
    },
    {
      title: "Detalle",
      className: "logosWrapper",
      render: (_, record) => (
        <div className="logos">
          <Tooltip
            title={
              <div className="toolTip -clientAccept">
                <p>Aceptación cliente</p>
                <strong>{formatDateBars(record.accept_date?.toString() || "0")}</strong>
              </div>
            }
            color={"#f7f7f7"}
            key={`C${record.id}`}
          >
            <Button icon={<CheckCircle size={"1.2rem"} />} />
          </Tooltip>
          <Button onClick={() => openInvoiceDetail(record.id)} icon={<Eye size={"1.2rem"} />} />
        </div>
      ),
      width: 100,
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
        className="concilationTable"
        columns={columns}
        pagination={false}
        dataSource={data.map((data) => ({ ...data, key: data.id }))}
      />
    </>
  );
};
