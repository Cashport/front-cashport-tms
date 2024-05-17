import { Dispatch, SetStateAction, useState } from "react";
import { Button, Table, TableProps, Tooltip, Typography } from "antd";

import { IInvoice } from "@/types/invoices/IInvoices";
import { CheckCircle, Eye, Handshake, Warning, WarningCircle } from "phosphor-react";
import "./invoicestable.scss";
import { daysLeft, formatDate } from "@/utils/utils";

const { Text } = Typography;

interface PropsInvoicesTable {
  dataSingleInvoice: IInvoice[];
  setSelectedRows: Dispatch<SetStateAction<IInvoice[] | undefined>>;
}

export const InvoicesTable = ({ dataSingleInvoice: data, setSelectedRows }: PropsInvoicesTable) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const openInvoiceDetail = () => {
    console.log("openInvoiceDetail");
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRow: any) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRow);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  const columns: TableProps<IInvoice>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text) => (
        <Text onClick={openInvoiceDetail} className="invoicesTable__id">
          {text}
        </Text>
      ),
      defaultSortOrder: "descend",
      sorter: (a, b) => a.id - b.id,
      showSorterTooltip: false
    },
    {
      title: "Emisión",
      dataIndex: "create_at",
      key: "create_at",
      render: (text) => <Text>{formatDate(text)}</Text>,
      defaultSortOrder: "descend",
      sorter: (a, b) => Date.parse(a.create_at) - Date.parse(b.create_at),
      showSorterTooltip: false
    },
    {
      title: "Pronto pago",
      key: "earlypay_date",
      dataIndex: "earlypay_date",
      render: (text) => <Text>{formatDate(text)}</Text>,
      defaultSortOrder: "descend",
      sorter: (a, b) => Date.parse(a.earlypay_date) - Date.parse(b.earlypay_date),
      showSorterTooltip: false
    },
    {
      title: "Vence",
      key: "expiration_date",
      dataIndex: "expiration_date",
      render: (text, record) => (
        <Tooltip
          title={
            <div className="toolTip -expirationDate">
              <p>Fecha de vencimiento</p>
              <strong>{formatDate(text)}</strong>
              <p>
                Condición de pago <strong>X días</strong>
              </p>
            </div>
          }
          color={"#f7f7f7"}
          key={record.id}
        >
          <Text className="expirationText">
            {daysLeft(text)} días <WarningCircle size={16} />
          </Text>
        </Tooltip>
      ),
      defaultSortOrder: "descend",
      sorter: (a, b) => Date.parse(a.expiration_date) - Date.parse(b.expiration_date),
      showSorterTooltip: false
    },
    {
      title: "Monto inicial",
      key: "initial_value",
      dataIndex: "initial_value",
      render: (text) => <Text className="cell">${text}</Text>,
      defaultSortOrder: "descend",
      sorter: (a, b) => a.initial_value - b.initial_value,
      showSorterTooltip: false
    },
    {
      title: "Ajustes",
      key: "ajust_value",
      dataIndex: "ajust_value",
      render: (text) =>
        text === 0 ? null : text > 0 ? (
          <Text>${text}</Text>
        ) : (
          <Text className="negativeAdjustment">${text}</Text>
        ),
      defaultSortOrder: "descend",
      sorter: (a, b) => a.ajust_value - b.ajust_value,
      showSorterTooltip: false
    },
    {
      title: "Pendiente",
      key: "current_value",
      dataIndex: "current_value",
      render: (text) => <Text>${text}</Text>,
      defaultSortOrder: "descend",
      sorter: (a, b) => a.current_value - b.current_value,
      showSorterTooltip: false
    },
    {
      title: "",
      key: "",
      dataIndex: "",
      render: (_, record) => (
        <div className="logos">
          <Tooltip
            title={
              <div className="toolTip -paymentAgreement">
                <p>Acuerdo de pago</p>
                <p>
                  Fecha <strong>xx/xx/xxxx</strong>
                </p>
                <p>
                  Monto <strong>$XXXXX</strong>
                </p>
              </div>
            }
            color={"#f7f7f7"}
            key={`A${record.id}`}
          >
            <Button onClick={openInvoiceDetail} icon={<Handshake size={"1.4rem"} />} />
          </Tooltip>

          <Tooltip
            title={
              <div className="toolTip -priceDifference">
                <p>Diferencia en precios</p>
                <p>
                  Monto <strong>$XXXXXX</strong>
                </p>
                <p>Producto faltante</p>
                <p>
                  Descuento <strong>$XXXXXX</strong>
                </p>
              </div>
            }
            color={"#f7f7f7"}
            key={`B${record.id}`}
          >
            <Button onClick={openInvoiceDetail} icon={<Warning size={"1.4rem"} />} />
          </Tooltip>

          <Tooltip
            title={
              <div className="toolTip -clientAccept">
                <p>Aceptación cliente</p>
                <p>Email</p>
                <strong>DD-MM-YYYY</strong>
              </div>
            }
            color={"#f7f7f7"}
            key={`C${record.id}`}
          >
            <Button onClick={openInvoiceDetail} icon={<CheckCircle size={"1.4rem"} />} />
          </Tooltip>

          <Button onClick={openInvoiceDetail} icon={<Eye size={"1.4rem"} />} />
        </div>
      )
    }
  ];

  return (
    <>
      <Table
        className="invoicesTable"
        columns={columns}
        dataSource={data.map((data) => ({ ...data, key: data.id }))}
        rowSelection={rowSelection}
        rowClassName={(record) => (selectedRowKeys.includes(record.id) ? "selectedRow" : "")}
      />
    </>
  );
};
