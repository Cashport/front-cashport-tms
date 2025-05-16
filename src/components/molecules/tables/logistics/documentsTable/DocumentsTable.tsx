import { Table } from "antd";

import { Eye } from "phosphor-react";

import { ICertificateAndDocuments } from "@/types/logistics/certificate/certificate";
import IconButton from "@/components/atoms/IconButton/IconButton";
import { ColumnsType } from "antd/es/table";
import { formatDate } from "@/utils/utils";
import BadgeDocumentStatus from "@/components/atoms/BadgeDocumentStatus/BadgeDocumentStatus";

type DocumentsTableProps = {
  selectedFiles: ICertificateAndDocuments[];
};

export const DocumentsTable = (props: DocumentsTableProps) => {
  const { selectedFiles } = props;

  const tableColumns: ColumnsType<ICertificateAndDocuments> = [
    { title: "Nombre", dataIndex: "name", key: "name", width: "20%" },
    {
      title: "Descripción",
      dataIndex: "description",
      key: "description",
      width: "35%"
    },
    {
      title: "Fecha cargue",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_: string, record: any) => (record.createdAt ? formatDate(record.createdAt) : "-"),
      width: "15%"
    },
    {
      title: "Vencimiento",
      dataIndex: "expirationDate",
      key: "expirationDate",
      render: (expirationDate) => (expirationDate ? formatDate(expirationDate) : "-"),
      width: "15%"
    },
    {
      title: "Obligatorio",
      dataIndex: "isMandatory",
      key: "isMandatory",
      render: (isMandatory: boolean) => <p>{isMandatory ? "Sí" : "No"}</p>,
      width: "10%"
    },
    {
      title: "Estado",
      dataIndex: "statusId",
      key: "statusId",
      render: (statusId: string) => <BadgeDocumentStatus statusId={statusId} />
    },
    {
      title: "",
      dataIndex: "seeMore",
      key: "seeMore",
      render: (_: any, record: any) => (
        <IconButton
          onClick={() => {
            // setSelectedDocument(record);
            // handleOpenDrawer();
          }}
          icon={<Eye size={"1.3rem"} />}
          style={{ backgroundColor: "#F4F4F4" }}
        />
      ),
      align: "right"
    }
  ];
  return (
    <Table
      style={{ width: "100%" }}
      columns={tableColumns}
      pagination={false}
      dataSource={selectedFiles.map((data) => ({ ...data, key: data.id }))}
    />
  );
};
