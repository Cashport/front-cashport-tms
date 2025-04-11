import { Button, Flex, Table, Tag, Typography } from "antd";
import type { TableProps } from "antd";
import { Eye } from "phosphor-react";

import dayjs from "dayjs";
import { DocumentCompleteType } from "@/types/logistics/certificate/certificate";

const { Text } = Typography;

type DocumentsTableProps = {
  selectedFiles: DocumentCompleteType[];
};

export const DocumentsTable = (props: DocumentsTableProps) => {
  const { selectedFiles } = props;

  const documentsTableColumns: TableProps<DocumentCompleteType>["columns"] = [
    {
      title: "Descripción",
      dataIndex: "description",
      key: "description",
      render: (text) => <Text>{text}</Text>
    },
    {
      title: "Fecha de Cargue",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => {
        return <Text>{dayjs.utc(date).format("DD/MM/YYYY")}</Text>;
      }
    },
    {
      title: "Vencimiento",
      dataIndex: "expirationDate",
      key: "expirationDate",
      render: (date) => (
        <Text>
          {dayjs.utc(date).format("DD/MM/YYYY") === "30/11/1899"
            ? "-"
            : dayjs.utc(date).format("DD/MM/YYYY")}
        </Text>
      )
    },
    {
      title: "Tipo",
      dataIndex: "optional",
      key: "optional",
      render: (optional) => (
        <Flex>
          <Tag
            color={optional ? "blue" : "red"}
            bordered={false}
            style={{ fontSize: "0.875rem", padding: "4px 8px" }}
          >
            {optional ? "Opcional" : "Obligatorio"}
          </Tag>
        </Flex>
      )
    },
    {
      title: "",
      key: "link",
      dataIndex: "link",
      render: (link?: string) => (
        <Button
          disabled={!link}
          icon={<Eye size={"1.3rem"} />}
          href={link}
          target="_blank"
          rel="noopener"
        />
      ),
      width: 70
    }
  ];

  return (
    <Table
      style={{ width: "100%" }}
      columns={documentsTableColumns}
      pagination={false}
      dataSource={selectedFiles.map((data) => ({ ...data, key: data.id }))}
    />
  );
};
