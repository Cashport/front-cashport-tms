"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";

import * as Yup from "yup";
import { Input, Select, Button, Table, Tag, Flex } from "antd";
import { yupResolver } from "@hookform/resolvers/yup";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { InputSelect } from "@/components/atoms/inputs/InputSelect/InputSelect";
import { FileArrowUp } from "phosphor-react";
// import "antd/dist/antd.css";

const { Option } = Select;

// Validation Schema
const validationSchema = Yup.object().shape({
  companyName: Yup.string().required("Razón Social es requerida"),
  documentNumber: Yup.string().required("Número de documento es requerido"),
  documentType: Yup.string().required("Seleccione el tipo de documento"),
  legalRepresentative: Yup.string().required("Nombre del representante legal es requerido"),
  supplierType: Yup.string().required("Seleccione el tipo de proveedor"),
  country: Yup.string().required("Seleccione el país"),
  department: Yup.string().required("Seleccione el departamento"),
  city: Yup.string().required("Seleccione la ciudad"),
  address: Yup.string().required("Dirección de entrega es requerida"),
  phone: Yup.string().required("Teléfono es requerido"),
  email: Yup.string()
    .email("Correo electrónico inválido")
    .required("Correo electrónico es requerido"),
  economicActivity: Yup.string().required("Seleccione la actividad económica")
});

// Document Data (Example)
const documents = [
  { id: 1, description: "RUT", status: "Pendiente" },
  { id: 2, description: "Referencia comercial", status: "Pendiente" },
  { id: 3, description: "Referencia bancaria no mayor a 30 días", status: "Pendiente" },
  { id: 4, description: "Cédula representante legal", status: "Pendiente" },
  { id: 5, description: "Formato selección, actualización de proveedores", status: "Pendiente" },
  { id: 6, description: "Capacidades y servicios", status: "Pendiente" }
];
export const OPTIONS_BASE_LOCATION: Option[] = [
  { value: 0, label: "Centro A" },
  { value: 1, label: "Centro B" },
  { value: 2, label: "Centro C" },
  { value: 3, label: "Centro D" }
];
const SupplierForm: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<any>({
    defaultValues: {
      companyName: "",
      documentNumber: "",
      documentType: "",
      legalRepresentative: "",
      supplierType: "",
      country: "",
      department: "",
      city: "",
      address: "",
      phone: "",
      email: "",
      economicActivity: ""
    },
    disabled: false,
    resolver: yupResolver(validationSchema)
  });
  const onSubmit = (data: any) => {
    console.log("Form Data:", data);
  };

  // Table Columns
  const columns = [
    {
      title: "Descripción",
      dataIndex: "description",
      key: "description"
    },
    {
      title: "Fecha cargue",
      dataIndex: "uploadDate",
      key: "uploadDate",
      render: () => "-"
    },
    {
      title: "Vencimiento",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: () => "-"
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color="orange">{status}</Tag>
    },
    {
      title: "",
      dataIndex: "actions",
      key: "actions",
      render: () => (
        <Flex>
          <Button htmlType="button" className="">
            <FileArrowUp size={16} />
            Cargar documento
          </Button>{" "}
        </Flex>
      )
    }
  ];

  return (
    <div>
      <Flex
        vertical
        gap={24}
        style={{
          background: "white",
          paddingTop: "2rem",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          paddingBottom: "2rem",
          borderRadius: "0.5rem"
        }}
      >
        <Flex vertical gap={16}>
          <h3>Información General</h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
              <InputForm
                titleInput="Razón social"
                placeholder="Ingresar razón social"
                control={control}
                nameInput="companyName"
                error={undefined}
              />
              <InputForm
                titleInput="No. de documento"
                placeholder="Ingresar no. de documento"
                control={control}
                nameInput="documentNumber"
                error={undefined}
              />

              <InputSelect
                titleInput="Tipo de documento"
                nameInput="documentType"
                control={control}
                error={undefined}
                options={OPTIONS_BASE_LOCATION}
                loading={false}
                isError={errors?.baseLocation !== undefined}
                placeholder="Seleccionar tipo de documento"
              />
              <InputForm
                titleInput="Nombre de representante legal"
                placeholder="Ingresar nombre"
                control={control}
                nameInput="legalRepresentative"
                error={undefined}
              />
              <InputSelect
                titleInput="Tipo de proveedor"
                nameInput="supplierType"
                control={control}
                error={undefined}
                options={OPTIONS_BASE_LOCATION}
                loading={false}
                placeholder="Seleccionar tipo de empresa"
              />
              <InputSelect
                titleInput="País"
                nameInput="country"
                control={control}
                error={undefined}
                options={OPTIONS_BASE_LOCATION}
                loading={false}
                placeholder="Seleccionar país"
              />
              <InputSelect
                titleInput="Departamento"
                nameInput="department"
                control={control}
                error={undefined}
                options={OPTIONS_BASE_LOCATION}
                loading={false}
                placeholder="Seleccionar departamento"
              />
              <InputSelect
                titleInput="Ciudad"
                nameInput="city"
                control={control}
                error={undefined}
                options={OPTIONS_BASE_LOCATION}
                loading={false}
                placeholder="Seleccionar ciudad"
              />
              <InputForm
                titleInput="Dirección de entrega"
                placeholder="Ingresar dirección"
                control={control}
                nameInput="address"
                error={undefined}
              />
              <InputForm
                titleInput="Teléfono"
                placeholder="Ingresar teléfono"
                control={control}
                nameInput="telephone"
                error={undefined}
              />
              <InputForm
                titleInput="Correo electrónico"
                placeholder="Ingresar correo electrónico"
                control={control}
                nameInput="email"
                error={undefined}
              />
              {/* Repeat for other fields */}
            </div>
          </form>
        </Flex>
        <hr />
        <Flex vertical gap={16}>
          <h3>Documentos</h3>
          <Table dataSource={documents} columns={columns} rowKey="id" pagination={false} />
        </Flex>
      </Flex>
      <Button type="primary" htmlType="submit" style={{ marginTop: "1rem" }}>
        Enviar
      </Button>
    </div>
  );
};

export default SupplierForm;
