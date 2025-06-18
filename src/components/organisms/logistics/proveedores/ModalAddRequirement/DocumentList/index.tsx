import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FileArrowDown, Plus } from "phosphor-react";
import { Table, Checkbox, Button, Typography, Flex, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import useScreenHeight from "@/components/hooks/useScreenHeight";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import {
  createDocumentBySubjectId,
  getAvailableDocumentTypes,
  IDocument
} from "@/services/logistics/providers/providers";

const { Text } = Typography;

interface Form {
  key: string;
  formName: string;
  validity: string;
  questions_quantity: number;
}

const mockedForms: Form[] = [
  { key: "1", formName: "Formulario de Registro", validity: "30 días", questions_quantity: 10 },
  { key: "2", formName: "Encuesta de Satisfacción", validity: "1 año", questions_quantity: 5 },
  { key: "3", formName: "Formato de Evaluación", validity: "Sin límite", questions_quantity: 20 }
];

interface Props {
  // eslint-disable-next-line no-unused-vars
  onClose: (cancelClicked?: boolean) => void;
  subjectId: number;
  listType: "documents" | "forms";
  addNewDocument: () => void;
}

const DocumentList = ({ onClose, subjectId, listType, addNewDocument }: Props) => {
  const [selectedRows, setSelectedRows] = useState<(IDocument | Form)[]>([]);
  const [documentList, setDocumentList] = useState<IDocument[]>();
  const [loadingOkButtton, setLoadingOkButtton] = useState(false);

  const height = useScreenHeight();

  const fetchAvailDocs = async () => {
    if (documentList) return;
    try {
      const response = await getAvailableDocumentTypes(subjectId || 0);
      setDocumentList(response);
    } catch (error) {
      console.error("Error al obtener documentos disponibles:", error);
    }
  };

  // Fetch documents when subjectId changes
  useEffect(() => {
    fetchAvailDocs();
  }, [subjectId]);

  const documentColumns: ColumnsType<IDocument> = [
    {
      title: "Documento",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Checkbox
          checked={!!selectedRows.find((row) => "id" in row && row.id === record.id)}
          onChange={(e) => handleCheckboxChange(record, e.target.checked)}
        >
          {text}
        </Checkbox>
      )
    },
    {
      title: "Vigencia",
      dataIndex: "validity",
      key: "validity",
      align: "left",
      render: (text) => <Text>{text ?? "-"}</Text>,
      width: 100
    },
    {
      title: "Plantilla",
      dataIndex: "template_url",
      key: "template_url",
      align: "center",
      render: (template: string) =>
        template ? (
          <Link
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              textDecoration: "underline"
            }}
            href={`/requisitos/plantilla/${template}`}
          >
            Documento <FileArrowDown size={16} />
          </Link>
        ) : (
          <Text>-</Text>
        ),
      width: 100
    }
  ];
  const formColumns: ColumnsType<any> = [
    {
      title: "Formulario",
      dataIndex: "formName",
      key: "formName",
      render: (text, record) => (
        <Checkbox
          checked={!!selectedRows.find((row) => "id" in row && row.id === record.id)}
          onChange={(e) => handleCheckboxChange(record, e.target.checked)}
        >
          {text}
        </Checkbox>
      )
    },
    {
      title: "Vigencia",
      dataIndex: "validity",
      key: "validity"
    },
    {
      title: "Preguntas",
      dataIndex: "questions_quantity",
      key: "questions_quantity"
    }
  ];
  const handleCheckboxChange = (record: IDocument | Form, isChecked: boolean) => {
    setSelectedRows((prev) => {
      const exists = prev.find((row) => {
        if ("id" in row && "id" in record) {
          return row.id === record.id;
        }
        return false;
      });
      if (isChecked && !exists) {
        return [...prev, record];
      } else if (!isChecked && exists) {
        return prev.filter((row) => {
          if ("id" in row && "id" in record) {
            return row.id !== record.id;
          }
          return true;
        });
      }
      return prev;
    });
  };

  const dataSource = listType === "documents" ? documentList : mockedForms;
  const columns = listType === "documents" ? documentColumns : formColumns;

  const handleCloseAndReset = () => {
    message.success("Documentos agregados correctamente");
    setSelectedRows([]);
    setDocumentList(undefined);
    onClose();
  };

  const handleAdd = async () => {
    if (listType === "documents") {
      setLoadingOkButtton(true);
      let allSuccessful = true;

      for (const row of selectedRows) {
        if ("id" in row) {
          try {
            await createDocumentBySubjectId(subjectId, row.id);
          } catch (error) {
            console.error(`Error al crear documento con ID ${row.id}:`, error);
            message.error(`Error al crear documento con ID ${row.id}`);
            allSuccessful = false;
          }
        }
      }

      if (allSuccessful) {
        handleCloseAndReset();
      }
      setLoadingOkButtton(false);
    }

    if (listType === "forms") {
      console.info("Formularios seleccionados:", selectedRows);
    }
  };

  return (
    <Flex vertical gap="1rem">
      <Table
        dataSource={dataSource as any}
        columns={columns as any}
        pagination={false}
        rowKey="key"
        size="small"
        scroll={{ y: height && height - 300 }}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell colSpan={columns.length} index={0}>
              <Button
                type="primary"
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  boxShadow: "none",
                  color: "black",
                  padding: "0",
                  fontWeight: "500"
                }}
                onClick={addNewDocument}
                icon={<Plus size={16} />}
              >
                {`Nuevo ${listType === "documents" ? "documento" : "formulario"}`}
              </Button>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
      <FooterButtons
        titleConfirm={`Agregar ${listType === "documents" ? "documentos" : "formularios"}`}
        onCancel={() => onClose(true)}
        handleOk={handleAdd}
        isConfirmDisabled={selectedRows.length === 0}
        isConfirmLoading={loadingOkButtton}
      />
    </Flex>
  );
};

export default DocumentList;
