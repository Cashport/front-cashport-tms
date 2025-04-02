import React, { useState } from "react";
import { Modal, Button, Form, Row, Col, Select, Input, Flex } from "antd";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FooterButtons } from "../ModalCreateJourney/components/FooterButtons/FooterButtons";
import styles from "./ModalCreateVehicle.module.scss";
import {
  OPTIONS_BASE_LOCATION,
  OPTIONS_PROVIDERS,
  OPTIONS_SAP_DESCRIPTION,
  OPTIONS_UNITS_MEASUREMENT,
  OPTIONS_VEHICLES
} from "./mocks";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { InputSelect } from "@/components/atoms/inputs/InputSelect/InputSelect";
import { useFormState } from "react-dom";
import { API } from "@/utils/api/api";
const { Option } = Select;

// Define the interface for the form
interface FormData {
  provider: string;
  vehicle: string;
  unitOfMeasure: string;
  baseLocation: string;
  sapDescription: string;
  from: number;
  to: number;
  value: number;
}

// Validation schema with yup
const schema = yup.object().shape({
  provider: yup.string().required("Provider is required"),
  vehicle: yup.string().required("Vehicle is required"),
  unitOfMeasure: yup.string().required("Unit of measure is required"),
  baseLocation: yup.string().required("Base location is required"),
  sapDescription: yup.string().required("SAP Description is required"),
  from: yup.number().required("From is required").min(0, "Must be a positive value"),
  to: yup.number().required("To is required").min(0, "Must be a positive value"),
  value: yup.number().required("Value is required").min(0, "Must be a positive value")
});

interface IModalProps {
  isOpen: boolean;
  closeModal: () => void;
}
const ModalCreateVehicleRate: React.FC<IModalProps> = ({ isOpen, closeModal }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Form configuration with react-hook-form and yup
  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm<FormData>({
    resolver: yupResolver(schema)
  });

  console.log("FORM watch", watch());

  console.log("FORM errors", errors);
  console.log("FORM isValid", isValid);

  const handleCancel = () => {
    closeModal();
    reset(); // Reset the form when closing
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    try {
      await API.post("/api/endpoint", data); // Change '/api/endpoint' to the correct endpoint
      closeModal();
      reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const Title = ({ title }: { title: string }) => {
    return (
      <Flex justify="space-between">
        <p className={styles.actionTitle}>{title}</p>
      </Flex>
    );
  };
  return (
    <Modal
      centered
      open={isOpen}
      width={880}
      styles={{
        body: {
          maxHeight: "85vh",
          overflowY: "auto",
          paddingTop: 24,
          scrollbarWidth: "none" /* Firefox */,
          msOverflowStyle: "none" /* Internet Explorer 10+ */
        }
      }}
      onCancel={handleCancel}
      title={<Title title={"Nueva tarifa"} />}
      footer={
        <FooterButtons
          backTitle={"Cancelar"}
          nextTitle={"Crear"}
          handleBack={handleCancel}
          handleNext={() => handleSubmit(onSubmit)()}
          nextDisabled={false}
          isSubmitting={isLoading}
        />
      }
    >
      <form>
        <Flex vertical gap={24}>
          <Flex gap={16}>
            {/* First row with 4 Select fields */}
            <Col span={6}>
              <InputSelect
                titleInput="Proveedor"
                nameInput="provider"
                control={control}
                error={errors?.provider}
                options={OPTIONS_PROVIDERS}
                loading={false}
                isError={errors?.provider !== undefined}
                placeholder="Seleccionar"
              />
            </Col>
            <Col span={6}>
              <InputSelect
                titleInput="Vehículo"
                nameInput="vehicle"
                control={control}
                error={errors?.vehicle}
                options={OPTIONS_VEHICLES}
                loading={false}
                isError={errors?.vehicle !== undefined}
                placeholder="Seleccionar"
              />
            </Col>
            <Col span={6}>
              <InputSelect
                titleInput="Unidad de medida"
                nameInput="unitOfMeasure"
                control={control}
                error={errors?.unitOfMeasure}
                options={OPTIONS_UNITS_MEASUREMENT}
                loading={false}
                isError={errors?.baseLocation !== undefined}
                placeholder="Seleccionar"
              />
            </Col>
            <Col span={6}>
              <InputSelect
                titleInput="Ubicación base"
                nameInput="baseLocation"
                control={control}
                error={errors?.baseLocation}
                options={OPTIONS_BASE_LOCATION}
                loading={false}
                isError={errors?.baseLocation !== undefined}
                placeholder="Seleccionar"
              />
            </Col>
          </Flex>
          <Flex gap={16}>
            <Col span={6}>
              <InputSelect
                titleInput="SAP Description"
                nameInput="sapDescription"
                control={control}
                error={errors?.sapDescription}
                options={OPTIONS_SAP_DESCRIPTION}
                loading={false}
                isError={errors?.sapDescription !== undefined}
                placeholder="Seleccionar"
              />
            </Col>
            <Col span={6}>
              <InputForm
                key={`From`}
                nameInput={`from`}
                placeholder="Desde"
                control={control}
                error={errors?.from}
                titleInput="Desde"
                // readOnly
              />
            </Col>
            <Col span={6}>
              <InputForm
                key={`To`}
                nameInput={`to`}
                placeholder="Hasta"
                control={control}
                error={errors?.to}
                titleInput="Hasta"
                // readOnly
              />
            </Col>
            <Col span={6}>
              <InputForm
                key={`value`}
                nameInput={`value`}
                placeholder="Valor"
                control={control}
                error={errors?.value}
                titleInput="Valor"
                // readOnly
              />
            </Col>
          </Flex>
        </Flex>
      </form>
    </Modal>
  );
};

export default ModalCreateVehicleRate;
