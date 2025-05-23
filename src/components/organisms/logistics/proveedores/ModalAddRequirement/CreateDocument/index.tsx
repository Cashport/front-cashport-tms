import React, { useState } from "react";
import { Modal, Form, Switch, Typography, Flex } from "antd";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { useForm } from "react-hook-form";
import { InputSelect } from "@/components/atoms/inputs/InputSelect/InputSelect";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import UploadButton from "../UploadButton";
const { Text, Title } = Typography;

type CreateDocumentModalProps = {
  isOpen: boolean;
  mode: "create" | "edit"; // Determina si es creación o edición
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (values: CreateDocumentFormValues) => void;
  initialValues?: CreateDocumentFormValues; // Valores iniciales para el modo de edición
};

type CreateDocumentFormValues = {
  documentName: string;
  validity: string;
  description: string;
  mandatory: boolean;
  file?: File | null;
};

export const CreateDocument: React.FC<CreateDocumentModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSubmit,
  initialValues
}) => {
  const [form] = Form.useForm();
  const [file, setFile] = useState<File | null>(initialValues?.file || null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch
  } = useForm<CreateDocumentFormValues>({});

  const handleUpload = (file: File) => {
    setFile(file);
    return false; // Evita la carga automática
  };

  const handleRemoveFile = () => {
    setFile(null);
  };
  const isMandatory = watch("mandatory");
  const handleFinish = (values: CreateDocumentFormValues) => {
    onSubmit({ ...values, file });
    form.resetFields();
    setFile(null);
  };

  return (
    <Modal
      title={<Title level={4}>{mode === "create" ? "Nuevo documento" : "Editar documento"}</Title>}
      open={isOpen}
      onCancel={onClose}
      footer={
        <FooterButtons
          titleCancel={"Cancelar"}
          titleConfirm={`Agregar documentos`}
          onCancel={onClose}
          handleOk={() => {}}
        />
      }
      width={"43rem"}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues || { mandatory: false }}
        onFinish={handleFinish}
      >
        <Flex vertical gap={"1.5rem"}>
          <Flex gap={"1.5rem"} align="center">
            <InputForm
              titleInput="Nombre del documento"
              placeholder="Ingresar nombre"
              control={control}
              nameInput="documentName"
              error={undefined}
              customStyle={{ width: "100%" }}
            />
            <InputSelect
              titleInput="Vigencia"
              placeholder="Seleccionar vigencia"
              control={control}
              nameInput="validity"
              error={errors.validity}
              options={[]}
              loading={false}
              isError={false}
            />
          </Flex>
          <InputForm
            titleInput="Descripción"
            placeholder="Ingresar descripción"
            control={control}
            nameInput="description"
            error={undefined}
          />
          <UploadButton
            onUpload={handleUpload}
            file={file}
            buttonText="Cargar plantilla"
            handleRemoveFile={handleRemoveFile}
          />
          <Flex gap={"0.5rem"} justify="flex-end">
            <Switch
              disabled={false}
              checked={isMandatory}
              onChange={(event) => {
                setValue("mandatory", event);
              }}
            />
            <Text>Obligatorio</Text>
          </Flex>
          <hr style={{ marginBottom: "1.5rem", border: "1px solid #EDEDED" }} />
        </Flex>
      </Form>
    </Modal>
  );
};
