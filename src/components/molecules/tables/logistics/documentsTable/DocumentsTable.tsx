import { SetStateAction, useState } from "react";
import { mutate } from "swr";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { Eye } from "phosphor-react";

import { formatDate } from "@/utils/utils";

import IconButton from "@/components/atoms/IconButton/IconButton";
import BadgeDocumentStatus from "@/components/atoms/BadgeDocumentStatus/BadgeDocumentStatus";
import DrawerComponent from "@/components/organisms/logistics/proveedores/DrawerComponent/DrawerComponent";

import { IProviderDocument } from "@/types/logistics/schema";

import "./documentsTable.scss";

type DocumentsTableProps = {
  currentFiles: IProviderDocument[];
  disableEyeButton?: boolean;
  subjectId?: number;
  // eslint-disable-next-line no-unused-vars
  setSelectedDocumentRows?: (value: SetStateAction<IProviderDocument[]>) => void;
  selectedDocumentRows?: IProviderDocument[];
  mutateId?: string;
};

export const DocumentsTable = (props: DocumentsTableProps) => {
  const [selectedDocument, setSelectedDocument] = useState<IProviderDocument>();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const {
    currentFiles,
    disableEyeButton,
    subjectId,
    setSelectedDocumentRows,
    selectedDocumentRows,
    mutateId
  } = props;

  const handleMutateSupplierInfo = () => {
    mutate(mutateId);
  };

  const handleOpenDrawer = () => {
    setDrawerVisible(true);
  };

  const onSelectChange = (_newSelectedRowKeys: React.Key[], newSelectedRow: any) => {
    setSelectedDocumentRows && setSelectedDocumentRows(newSelectedRow);
  };

  const rowSelection = {
    columnWidth: 40,
    selectedRowKeys: selectedDocumentRows?.map((row) => row.id) || [],
    onChange: onSelectChange
  };

  const tableColumns: ColumnsType<IProviderDocument> = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Descripción",
      dataIndex: "description",
      key: "description"
    },
    {
      title: "Fecha cargue",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_: string, record: any) => (record.createdAt ? formatDate(record.createdAt) : "-"),
      width: 130
    },
    {
      title: "Vencimiento",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (expiryDate) => (expiryDate ? formatDate(expiryDate) : "-"),
      width: 125
    },
    {
      title: "Obligatorio",
      dataIndex: "isMandatory",
      key: "isMandatory",
      render: (isMandatory?: boolean) => {
        if (isMandatory === undefined) return "-";
        return <p>{isMandatory ? "Sí" : "No"}</p>;
      },
      width: 113,
      align: "center"
    },
    {
      title: "Estado",
      dataIndex: "statusId",
      key: "statusId",
      render: (statusId: string) => <BadgeDocumentStatus statusId={statusId} />,
      className: "status-column"
    },
    {
      title: "",
      dataIndex: "seeMore",
      key: "seeMore",
      render: (_: any, record: any) => (
        <IconButton
          disabled={disableEyeButton}
          onClick={() => {
            setSelectedDocument(record);
            handleOpenDrawer();
          }}
          icon={<Eye size={"1.3rem"} />}
          style={{ backgroundColor: "#F4F4F4" }}
        />
      ),
      align: "right",
      width: 50
    }
  ];

  return (
    <>
      <Table
        className="documentsTable"
        columns={tableColumns}
        pagination={false}
        dataSource={currentFiles?.map((data) => ({ ...data, key: data.id }))}
        rowSelection={rowSelection}
      />
      <DrawerComponent
        visible={drawerVisible}
        subjectId={subjectId?.toString() || ""}
        documentId={selectedDocument?.id || 0}
        onClose={() => setDrawerVisible(false)}
        mutateSupplierInfo={handleMutateSupplierInfo}
      />
    </>
  );
};
