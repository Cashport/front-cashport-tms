import { Modal, Flex, Col, Typography } from "antd";
import { useForm } from "react-hook-form";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { InputSelect } from "@/components/atoms/inputs/InputSelect/InputSelect";
import { FooterButtons } from "@/components/atoms/buttons/FooterButtons/FooterButtons";
import { Title } from "@/components/atoms/Title/Title";
import { useState, useEffect } from "react";
import styles from "./ModalCreateRate.module.scss";

const { Text } = Typography;

interface IModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

interface IFormRate {
  serviceItemSAP: string;
  serviceDescriptionSAP: string;
  serviceLineDescriptionSAP: string;
  oaSAP: string;
  provider: string;
  contract: string;
  serviceType: string;
  vehicleType: string;
  rateType: string;
  from: string;
  to: string;
  rateDetail: string;
  otherServices: string;
  amount: number;
}

const ModalCreateRate: React.FC<IModalProps> = ({ isOpen, closeModal }) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<IFormRate>();

  const [isLoading, setIsLoading] = useState(false);
  const rateType = watch("rateType");

  const handleCancel = () => {
    closeModal();
  };

  const onSubmit = async (data: IFormRate) => {
    try {
      setIsLoading(true);
      // TODO: Implementar lógica de guardado
      console.log(data);
      closeModal();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
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
          scrollbarWidth: "none",
          msOverflowStyle: "none"
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
          {/* Primera fila - Campos SAP */}
          <Flex gap={16}>
            <Col span={6}>
              <InputForm
                titleInput="Service Item SAP"
                nameInput="serviceItemSAP"
                control={control}
                error={errors?.serviceItemSAP}
                placeholder="Ingrese el código"
              />
            </Col>
            <Col span={6}>
              <InputForm
                titleInput="Service Description SAP"
                nameInput="serviceDescriptionSAP"
                control={control}
                error={errors?.serviceDescriptionSAP}
                placeholder="Ingrese la descripción"
              />
            </Col>
            <Col span={6}>
              <InputForm
                titleInput="Service Line Description SAP"
                nameInput="serviceLineDescriptionSAP"
                control={control}
                error={errors?.serviceLineDescriptionSAP}
                placeholder="Ingrese el nombre"
              />
            </Col>
            <Col span={6}>
              <InputForm
                titleInput="OA SAP"
                nameInput="oaSAP"
                control={control}
                error={errors?.oaSAP}
                placeholder="Ingrese el nombre"
              />
            </Col>
          </Flex>

          {/* Segunda fila - Selects dependientes */}
          <Flex gap={16}>
            <Col span={6}>
              <InputSelect
                titleInput="Proveedor"
                nameInput="provider"
                control={control}
                error={errors?.provider}
                options={[]} // TODO: Agregar opciones
                loading={false}
                isError={errors?.provider !== undefined}
                placeholder="Seleccionar"
              />
            </Col>
            <Col span={6}>
              <InputSelect
                titleInput="Contrato"
                nameInput="contract"
                control={control}
                error={errors?.contract}
                options={[]} // TODO: Agregar opciones dependientes del proveedor
                loading={false}
                isError={errors?.contract !== undefined}
                placeholder="Seleccionar"
                disabled={!watch("provider")}
              />
            </Col>
            <Col span={6}>
              <InputSelect
                titleInput="Tipo de servicio"
                nameInput="serviceType"
                control={control}
                error={errors?.serviceType}
                options={[]} // TODO: Agregar opciones
                loading={false}
                isError={errors?.serviceType !== undefined}
                placeholder="Seleccionar"
              />
            </Col>
            <Col span={6}>
              <InputSelect
                titleInput="Tipo de vehículo"
                nameInput="vehicleType"
                control={control}
                error={errors?.vehicleType}
                options={[]} // TODO: Agregar opciones dependientes del tipo de servicio
                loading={false}
                isError={errors?.vehicleType !== undefined}
                placeholder="Seleccionar"
                disabled={!watch("serviceType")}
              />
            </Col>
          </Flex>

          {/* Tercera fila - Tipo de tarifa y campos dinámicos */}
          <Flex gap={16}>
            <Col span={6}>
              <InputSelect
                titleInput="Tipo de tarifa"
                nameInput="rateType"
                control={control}
                error={errors?.rateType}
                options={[
                  { value: "KM", label: "Kilómetros" },
                  { value: "OTROS", label: "Otros servicios" },
                  { value: "HORAS", label: "Horas" },
                  { value: "NOVEDAD", label: "Novedad" },
                  { value: "RENTAS", label: "Rentas fijas" }
                ]}
                loading={false}
                isError={errors?.rateType !== undefined}
                placeholder="Seleccionar"
              />
            </Col>
            <Col span={6}>
              <InputForm
                titleInput="Desde"
                nameInput="from"
                control={control}
                error={errors?.from}
                placeholder="Ingrese valor"
                disabled={!["KM", "HORAS"].includes(rateType || "")}
              />
            </Col>
            <Col span={6}>
              <InputForm
                titleInput="Hasta"
                nameInput="to"
                control={control}
                error={errors?.to}
                placeholder="Ingrese valor"
                disabled={!["KM", "HORAS"].includes(rateType || "")}
              />
            </Col>
            <Col span={6}>
              <InputForm
                titleInput="Monto"
                nameInput="amount"
                control={control}
                error={errors?.amount}
                placeholder="$0"
                type="number"
              />
            </Col>
          </Flex>

          {/* Cuarta fila - Campos adicionales */}
          <Flex gap={16}>
            <Col span={12}>
              <InputForm
                titleInput="Detalle de tarifa"
                nameInput="rateDetail"
                control={control}
                error={errors?.rateDetail}
                placeholder="Ingrese detalle"
                disabled={!["OTROS", "HORAS", "NOVEDAD", "RENTAS"].includes(rateType || "")}
              />
            </Col>
            <Col span={12}>
              <InputSelect
                titleInput="Otros servicios"
                nameInput="otherServices"
                control={control}
                error={errors?.otherServices}
                options={[]} // TODO: Agregar opciones
                loading={false}
                isError={errors?.otherServices !== undefined}
                placeholder="Seleccionar"
                disabled={rateType !== "OTROS"}
              />
            </Col>
          </Flex>
        </Flex>
      </form>
    </Modal>
  );
};

export default ModalCreateRate; 