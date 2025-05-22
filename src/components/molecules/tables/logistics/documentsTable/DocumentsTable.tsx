import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { mutate } from "swr";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { Eye } from "phosphor-react";

import { extractSingleParam, formatDate } from "@/utils/utils";

import IconButton from "@/components/atoms/IconButton/IconButton";
import BadgeDocumentStatus from "@/components/atoms/BadgeDocumentStatus/BadgeDocumentStatus";
import DrawerComponent from "@/components/organisms/logistics/proveedores/DrawerComponent/DrawerComponent";

import { IProviderDocument } from "@/types/logistics/schema";

type DocumentsTableProps = {
  selectedFiles: IProviderDocument[];
  disableEyeButton?: boolean;
  subjectId?: number;
};

export const DocumentsTable = (props: DocumentsTableProps) => {
  const params = useParams();
  const vehicleId = extractSingleParam(params.vehicleId) || "";
  const [selectedDocument, setSelectedDocument] = useState<IProviderDocument>();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { selectedFiles, disableEyeButton, subjectId } = props;

  const handleMutateSupplierInfo = () => {
    mutate(vehicleId);
  };

  const handleOpenDrawer = () => {
    setDrawerVisible(true);
  };

  const tableColumns: ColumnsType<IProviderDocument> = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      ellipsis: {
        showTitle: false
      }
    },
    {
      title: "Descripción",
      dataIndex: "description",
      key: "description",
      ellipsis: {
        showTitle: false
      }
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
      width: 113
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
        scroll={{ x: "max-content" }}
        columns={tableColumns}
        pagination={false}
        dataSource={selectedFiles.map((data) => ({ ...data, key: data.id }))}
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
