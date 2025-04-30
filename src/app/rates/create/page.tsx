"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Flex, Col, Typography, Card, message } from "antd";
import type { SelectProps } from "antd";

import { ratesService } from "@/services/rates";

import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { InputSelect } from "@/components/atoms/inputs/InputSelect/InputSelect";
import { useProviders, useContracts, useVehicleTypes, useOtherServices } from "@/hooks/useRates";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

import { RateType, RateTypeLabels, ServiceTypeIds, ServiceTypeLabels } from "@/enums/rates";

import styles from "./page.module.scss";

const { Title } = Typography;

interface IFormRate {
  serviceItemSAP: string;
  serviceDescriptionSAP: string;
  serviceLineDescriptionSAP: string;
  oaSAP: string;
  provider: string;
  serviceType: (typeof ServiceTypeIds)[keyof typeof ServiceTypeIds];
  vehicleType: string;
  rateType: RateType;
  from: string;
  to: string;
  rateDetail: string;
  otherServices?: string;
  amount: number;
  contract: string;
}

export default function CreateRatePage() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<IFormRate>({
    shouldUnregister: true // 👈🏻 Importante aquí
  });

  const [isLoading, setIsLoading] = useState(false);

  // Valores observados para los selects dependientes
  const providerId = watch("provider");
  const serviceTypeId = watch("serviceType");
  const rateType = watch("rateType");

  // Hooks para obtener datos
  const { providers, loading: loadingProviders } = useProviders();
  const { contracts, loading: loadingContracts } = useContracts(providerId);
  const { vehicleTypes, loading: loadingVehicleTypes } = useVehicleTypes(serviceTypeId);
  const { otherServices, loading: loadingOtherServices } = useOtherServices();

  const onSubmit = async (data: IFormRate) => {
    try {
      setIsLoading(true);
      await ratesService.createRate(data);
      message.success("Tarifa creada exitosamente");
      router.push("/rates");
    } catch (error) {
      console.error(error);
      message.error("Error al crear la tarifa");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/rates");
  };

  // Función para filtrar las opciones del select de vehículos
  const filterVehicleOption: SelectProps["filterOption"] = (input, option) => {
    if (typeof option?.label === "string") {
      return option.label.toLowerCase().includes(input.toLowerCase());
    }
    return false;
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formCard}>
        <Title level={2}>Datos de la tarifa</Title>
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
          <Flex vertical gap={24} style={{ width: "100%" }}>
            {/* Primera fila - Campos SAP */}
            <div className={styles.inputRow}>
              <InputForm
                titleInput="Service Item SAP"
                nameInput="serviceItemSAP"
                control={control}
                error={errors?.serviceItemSAP}
                placeholder="0000000"
                validationRules={{ required: "Este campo es requerido" }}
                style={{ width: "100%" }}
              />

              <InputForm
                titleInput="Service Description SAP"
                nameInput="serviceDescriptionSAP"
                control={control}
                error={errors?.serviceDescriptionSAP}
                placeholder="0000000"
                validationRules={{ required: "Este campo es requerido" }}
                style={{ width: "100%" }}
              />

              <InputForm
                titleInput="Service Line Description SAP"
                nameInput="serviceLineDescriptionSAP"
                control={control}
                error={errors?.serviceLineDescriptionSAP}
                placeholder="Ingrese el nombre"
                validationRules={{ required: "Este campo es requerido" }}
                style={{ width: "100%" }}
              />

              <InputForm
                titleInput="OA SAP"
                nameInput="oaSAP"
                control={control}
                error={errors?.oaSAP}
                placeholder="Ingrese el nombre"
                validationRules={{ required: "Este campo es requerido" }}
                style={{ width: "100%" }}
              />
            </div>

            {/* Segunda fila */}
            <div className={styles.inputRow}>
              <InputSelect
                titleInput="Proveedor"
                nameInput="provider"
                control={control}
                error={errors?.provider}
                options={providers}
                loading={loadingProviders}
                placeholder="Seleccionar el estado"
                validationRules={{ required: "Este campo es requerido" }}
                dropdownMatchSelectWidth={false}
                style={{ width: "100%" }}
              />

              <InputSelect
                titleInput="Tipo de servicio"
                nameInput="serviceType"
                control={control}
                error={errors?.serviceType}
                options={Object.entries(ServiceTypeLabels).map(([value, label]) => ({
                  value: ServiceTypeIds[value as keyof typeof ServiceTypeIds],
                  label
                }))}
                loading={false}
                placeholder="Seleccionar el estado"
                validationRules={{ required: "Este campo es requerido" }}
                dropdownMatchSelectWidth={false}
                style={{ width: "100%" }}
              />

              <InputSelect
                titleInput="Tipo de vehículo"
                nameInput="vehicleType"
                control={control}
                error={errors?.vehicleType}
                options={vehicleTypes}
                loading={loadingVehicleTypes}
                placeholder="Seleccionar el estado"
                disabled={!serviceTypeId}
                validationRules={{ required: "Este campo es requerido" }}
                filterOption={filterVehicleOption}
                dropdownMatchSelectWidth={false}
                style={{ width: "100%" }}
              />

              <InputSelect
                titleInput="Tipo de tarifa"
                nameInput="rateType"
                control={control}
                error={errors?.rateType}
                options={Object.entries(RateTypeLabels).map(([value, label]) => ({
                  value,
                  label
                }))}
                loading={false}
                placeholder="Seleccionar el estado"
                validationRules={{ required: "Este campo es requerido" }}
                dropdownMatchSelectWidth={false}
                style={{ width: "100%" }}
              />
            </div>

            {/* Tercera fila */}
            <div className={styles.inputRow}>
              <InputForm
                titleInput="Desde"
                nameInput="from"
                control={control}
                error={errors?.from}
                placeholder="0"
                disabled={![RateType.KM, RateType.HORAS].includes(rateType as RateType)}
                validationRules={
                  [RateType.KM, RateType.HORAS].includes(rateType as RateType)
                    ? { required: "Este campo es requerido" }
                    : undefined
                }
                style={{ width: "100%" }}
              />

              <InputForm
                titleInput="Hasta"
                nameInput="to"
                control={control}
                error={errors?.to}
                placeholder="50"
                disabled={![RateType.KM, RateType.HORAS].includes(rateType as RateType)}
                validationRules={
                  [RateType.KM, RateType.HORAS].includes(rateType as RateType)
                    ? { required: "Este campo es requerido" }
                    : undefined
                }
                style={{ width: "100%" }}
              />

              <InputForm
                titleInput="Detalle de tarifa"
                nameInput="rateDetail"
                control={control}
                error={errors?.rateDetail}
                placeholder="Ingresar el objeto"
                disabled={
                  ![
                    RateType.OTROS,
                    RateType.HORAS,
                    RateType.NOVEDAD,
                    RateType.MESES,
                    RateType.DIAS,
                    RateType.SEMANAS
                  ].includes(rateType as RateType)
                }
                validationRules={
                  [
                    RateType.OTROS,
                    RateType.HORAS,
                    RateType.NOVEDAD,
                    RateType.MESES,
                    RateType.DIAS,
                    RateType.SEMANAS
                  ].includes(rateType as RateType)
                    ? { required: "Este campo es requerido" }
                    : undefined
                }
                style={{ width: "100%" }}
              />

              <InputSelect
                titleInput="Otros servicios"
                nameInput="otherServices"
                control={control}
                error={errors?.otherServices}
                options={otherServices}
                loading={loadingOtherServices}
                isError={errors?.otherServices !== undefined}
                placeholder="Seleccionar el estado"
                disabled={rateType !== RateType.OTROS}
                validationRules={
                  rateType === RateType.OTROS ? { required: "Este campo es requerido" } : undefined
                }
                noRequired={rateType !== RateType.OTROS}
                dropdownMatchSelectWidth={false}
                style={{ width: "100%" }}
              />
            </div>

            {/* Cuarta fila */}
            <div className={styles.inputRow}>
              <InputForm
                titleInput="Monto"
                nameInput="amount"
                control={control}
                error={errors?.amount}
                placeholder="10,000.00"
                typeInput="number"
                validationRules={{ required: "Este campo es requerido" }}
                style={{ width: "100%" }}
              />

              <InputSelect
                titleInput="Contrato"
                nameInput="contract"
                control={control}
                error={errors?.contract}
                options={contracts}
                loading={loadingContracts}
                placeholder="Seleccionar el estado"
                disabled={!providerId}
                validationRules={{ required: "Este campo es requerido" }}
                dropdownMatchSelectWidth={false}
              />
            </div>

            {/* Botones de acción */}
            <Flex gap={16} justify="end">
              <FooterButtons
                titleCancel="Cancelar"
                titleConfirm={isLoading ? "Guardando..." : "Guardar"}
                isConfirmDisabled={isLoading}
                onCancel={handleCancel}
                handleOk={handleSubmit(onSubmit)}
              />
            </Flex>
          </Flex>
        </form>
      </div>
    </div>
  );
}
