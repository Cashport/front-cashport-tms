"use client";
import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Modal, Select, Table, TableProps, Typography, message } from "antd";
import { DownloadSimple, Sparkle } from "phosphor-react";

import useScreenHeight from "@/components/hooks/useScreenHeight";
import { auditRequirements } from "@/services/logistics/providers/providers";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import IconButton from "@/components/atoms/IconButton/IconButton";
import { InputDateForm } from "@/components/atoms/inputs/InputDate/InputDateForm";
import BadgeDocumentStatus from "@/components/atoms/BadgeDocumentStatus/BadgeDocumentStatus";

import { IProviderDocument } from "@/types/logistics/schema";

import "./modalAuditRequirements.scss";
const { Title } = Typography;

export interface IAuditTableRow {
  id: number;
  requrementType: string;
  requirementsState: string;
  audit?: string;
  commentary?: string;
  document?: any;
  expiryDate?: string;
  validity?: boolean;
}

interface IAuditFormValues {
  rows: IAuditTableRow[];
}

interface Props {
  isOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  onClose: (cancelClicked?: boolean) => void;
  selectedRows: IProviderDocument[] | undefined;
}

const ModalAuditRequirements = ({ isOpen, onClose, selectedRows }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localSelectedRows, setLocalSelectedRows] = useState<IProviderDocument[]>([]);
  const height = useScreenHeight();

  const { control, handleSubmit, reset, watch } = useForm<IAuditFormValues>();

  const auditValues = watch("rows");

  useEffect(() => {
    return () => {
      reset();
    };
  }, [isOpen]);

  useEffect(() => {
    if (selectedRows) {
      const defaultRows = selectedRows.map((doc) => ({
        id: doc.id,
        requrementType: doc.name,
        requirementsState: doc.statusId,
        audit: undefined,
        commentary: undefined,
        expiryDate: doc.expiryDate || undefined,
        validity: doc.validity.expiry || false
      }));
      reset({ rows: defaultRows });
    }
  }, [selectedRows, reset]);

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRow: any) => {
    setLocalSelectedRows(newSelectedRow);
  };

  const rowSelection = {
    selectedRowKeys: localSelectedRows.map((item) => item.id),
    onChange: onSelectChange
  };

  const onSubmit = async (data: IAuditFormValues) => {
    console.log("data", data);
    setIsSubmitting(true);

    try {
      await auditRequirements(data.rows);
      message.success("Requerimientos auditados correctamente");
      onClose();
    } catch (error) {
      message.error("Error al auditar requerimientos");
    }
    setIsSubmitting(false);
  };

  const columns: TableProps<IAuditTableRow>["columns"] = [
    {
      title: "Tipo de requerimiento",
      dataIndex: "requrementType",
      key: "requrementType"
    },
    {
      title: "Estado",
      dataIndex: "requirementsState",
      key: "requirementsState",
      render: (requirementsState) => {
        return <BadgeDocumentStatus statusId={requirementsState} />;
      }
    },
    {
      title: "Vencimiento",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (_: any, record, index: number) => {
        const isExpiryRequired = record.validity;
        return (
          <InputDateForm
            titleInput="Fecha de vencimiento"
            nameInput={`rows.${index}.expiryDate`}
            control={control}
            error={undefined}
            hiddenTitle={true}
            placeholder={!isExpiryRequired ? "No requerido" : "Selecciona fecha"}
            disabled={!isExpiryRequired}
            validationRules={{ required: isExpiryRequired }}
          />
        );
      },
      width: 200
    },
    {
      title: "Comentario",
      dataIndex: "commentary",
      key: "commentary",
      render: (_: any, record: any, index: number) => {
        const auditValue = auditValues?.[index]?.audit;
        const isRejection = auditValue === "Rechazar";

        return (
          <Controller
            control={control}
            name={`rows.${index}.commentary`}
            rules={{
              validate: (value) =>
                isRejection && !value ? "Este campo es obligatorio al rechazar" : true
            }}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                placeholder="Agrega un comentario"
                className={
                  fieldState.invalid && isRejection
                    ? "inputAuditRequirements inputAuditRequirements__error"
                    : "inputAuditRequirements"
                }
              />
            )}
          />
        );
      },
      width: 300
    },
    {
      title: "Auditar",
      dataIndex: "audit",
      key: "audit",
      render: (_: any, record: any, index: number) => (
        <Controller
          control={control}
          name={`rows.${index}.audit`}
          rules={{ required: true }}
          render={({ field }) => (
            <Select
              {...field}
              placeholder=" - "
              options={[
                { value: "Aprobar", label: "Aprobar" },
                { value: "Rechazar", label: "Rechazar" }
              ]}
              className="selectAuditRequirements"
            />
          )}
        />
      ),
      width: 200
    },
    {
      title: "",
      dataIndex: "document",
      key: "document",
      render: () => {
        return (
          <IconButton
            icon={<DownloadSimple size={26} className="icon" />}
            className="iconDocument"
          />
        );
      },
      width: 60
    }
  ];

  const tableData: IAuditTableRow[] = useMemo(() => {
    if (!selectedRows) return [];

    return selectedRows.map((doc) => ({
      id: doc.id,
      requrementType: doc.name,
      requirementsState: doc.statusId || "",
      validity: doc.validity.expiry
    }));
  }, [selectedRows]);

  return (
    <Modal
      className="modalAuditRequirements"
      width="80%"
      footer={null}
      open={isOpen}
      closable={false}
      destroyOnClose
    >
      <Title level={4}>Auditar Requerimientos</Title>

      <Table
        className="modalAuditRequirements__documentsTable"
        columns={columns}
        dataSource={tableData.map((item) => ({ ...item, key: item.id }))}
        rowSelection={rowSelection}
        pagination={false}
        scroll={{ y: height && height - 400 }}
      />

      <div className="modalAuditRequirements__footer">
        <Button className="iaButton">
          <Sparkle size={14} color="#5b21b6" weight="fill" />
          <span className="textNormal">
            Analizar con{" "}
            <span
              className="cashportIATextGradient"
              style={{
                fontWeight: 500
              }}
            >
              Cashport IA
            </span>
          </span>
        </Button>

        <FooterButtons
          className="modalAuditRequirements__footerButtons"
          titleCancel="Volver"
          onCancel={() => onClose(true)}
          handleOk={handleSubmit(onSubmit)}
          titleConfirm="Guardar"
          isConfirmLoading={isSubmitting}
        />
      </div>
    </Modal>
  );
};

export default ModalAuditRequirements;
