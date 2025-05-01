"use client";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Flex, Input, Modal, Typography, message } from "antd";
import { NumericFormat } from "react-number-format";

import { ratesService } from "@/services/rates";
import { useProviders, useContracts, useVehicleTypes, useOtherServices } from "@/hooks/useRates";
import { useLocations } from "@/hooks/logistics/useLocations";

import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { SelectInputForm } from "@/components/molecules/logistics/SelectInputForm/SelectInputForm";
import ModalAttachEvidence from "@/components/molecules/modals/ModalEvidence/ModalAttachEvidence";

import { RateType, RateTypeLabels, ServiceTypeIds, ServiceTypeLabels } from "@/enums/rates";

import styles from "./page.module.scss";

const { Title } = Typography;

export interface IFormRate {
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
  amount: string;
  contract: string;
  destination: string;
  origin: string;
}

export default function CreateRatePage() {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<IFormRate>({
    shouldUnregister: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isOpenShowEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<File[]>([]);
  const [commentary, setCommentary] = useState<string>();

  // Valores observados para los selects dependientes
  const providerId = watch("provider");
  const serviceTypeId = watch("serviceType");
  const rateType = watch("rateType");

  // Hooks para obtener datos
  const { providers, loading: loadingProviders } = useProviders();
  const { contracts, loading: loadingContracts } = useContracts(providerId);
  const { vehicleTypes, loading: loadingVehicleTypes } = useVehicleTypes(serviceTypeId);
  const { otherServices, loading: loadingOtherServices } = useOtherServices();
  const { data: locationsData, isLoading: loadingLocations } = useLocations();

  const onSubmit = async (data: IFormRate) => {
    try {
      setIsLoading(true);
      console.log("Data to create rate:", data);
      console.log("Selected evidence:", selectedEvidence);
      console.log("Commentary:", commentary);
      await ratesService.createRate({ data, commentary, file: selectedEvidence[0] });
      message.success("Tarifa creada exitosamente");
    } catch (error) {
      console.error(error);
      message.error("Error al crear la tarifa");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRate = async () => {
    //  open evidenceModal
    setShowEvidenceModal(true);
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
              <Flex vertical>
                <p className={styles.inputTitle}>Proveedor</p>
                <Controller
                  name="provider"
                  control={control}
                  rules={{ required: "Este campo es requerido" }}
                  render={({ field }) => (
                    <SelectInputForm
                      placeholder="Seleccionar proveedor"
                      error={errors?.provider}
                      field={field}
                      options={providers?.map((p) => ({ id: p.value, value: p.label })) ?? []}
                      loading={loadingProviders}
                      showSearch
                      dropdownStyles={{ width: "450px" }}
                    />
                  )}
                />
              </Flex>

              <Flex vertical>
                <p className={styles.inputTitle}>Tipo de servicio</p>
                <Controller
                  name="serviceType"
                  control={control}
                  rules={{ required: "Este campo es requerido" }}
                  render={({ field }) => (
                    <SelectInputForm
                      placeholder="Seleccionar tipo de servicio"
                      error={errors?.serviceType}
                      field={field}
                      options={Object.entries(ServiceTypeLabels).map(([value, label]) => ({
                        id: ServiceTypeIds[value as keyof typeof ServiceTypeIds],
                        value: label
                      }))}
                    />
                  )}
                />
              </Flex>

              <Flex vertical>
                <p className={styles.inputTitle}> Tipo de vehículo</p>
                <Controller
                  name="vehicleType"
                  control={control}
                  rules={{ required: "Este campo es requerido" }}
                  disabled={!serviceTypeId}
                  render={({ field }) => (
                    <SelectInputForm
                      placeholder="Seleccionar tipo de vehículo"
                      error={errors?.vehicleType}
                      field={field}
                      options={
                        vehicleTypes.map((vehicleType) => ({
                          id: vehicleType.value,
                          value: vehicleType.label
                        })) ?? []
                      }
                      loading={loadingVehicleTypes}
                      showSearch
                    />
                  )}
                />
              </Flex>

              <Flex vertical>
                <p className={styles.inputTitle}>Tipo de tarifa</p>
                <Controller
                  name="rateType"
                  control={control}
                  rules={{ required: "Este campo es requerido" }}
                  render={({ field }) => (
                    <SelectInputForm
                      placeholder="Seleccionar tipo de tarifa"
                      error={errors?.rateType}
                      field={field}
                      options={Object.entries(RateTypeLabels).map(([value, label]) => ({
                        id: value,
                        value: label
                      }))}
                    />
                  )}
                />
              </Flex>
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

              <Flex vertical className="selectButton">
                <p className={styles.inputTitle}>Otros servicios</p>
                <Controller
                  name="otherServices"
                  control={control}
                  disabled={rateType !== RateType.OTROS}
                  rules={
                    rateType === RateType.OTROS
                      ? { required: "Este campo es requerido" }
                      : undefined
                  }
                  render={({ field }) => (
                    <SelectInputForm
                      placeholder="Seleccionar otros servicios"
                      error={errors?.otherServices}
                      field={field}
                      options={
                        otherServices.map((service) => ({
                          id: service.value,
                          value: service.label
                        })) ?? []
                      }
                      loading={loadingOtherServices}
                    />
                  )}
                />
              </Flex>
            </div>

            {/* Cuarta fila */}
            <div className={styles.inputRow}>
              <Flex vertical className="selectButton">
                <p className={styles.inputTitle}>Monto</p>
                <Controller
                  name="amount"
                  control={control}
                  rules={{ required: "Este campo es requerido" }}
                  render={({ field }) => (
                    <NumericFormat
                      {...field}
                      thousandSeparator="."
                      decimalSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                      allowNegative={false}
                      customInput={Input}
                      placeholder="10,000.00"
                      className={!errors?.amount ? styles.inputForm : styles.inputFormError}
                    />
                  )}
                />
                {errors?.amount && (
                  <Typography.Text type="danger" className="textMessageError">
                    {errors.amount.message}
                  </Typography.Text>
                )}
              </Flex>

              <Flex vertical className="selectButton">
                <p className={styles.inputTitle}>Contrato</p>
                <Controller
                  name="contract"
                  control={control}
                  disabled={!providerId}
                  rules={{ required: "Este campo es requerido" }}
                  render={({ field }) => (
                    <SelectInputForm
                      placeholder="Seleccionar contrato"
                      error={errors?.contract}
                      field={field}
                      options={
                        contracts.map((contract) => ({
                          id: contract.value,
                          value: contract.label
                        })) ?? []
                      }
                      loading={loadingContracts}
                    />
                  )}
                />
              </Flex>

              <Flex vertical className="selectButton">
                <p className={styles.inputTitle}>Destino</p>
                <Controller
                  name="destination"
                  control={control}
                  rules={{ required: "Este campo es requerido" }}
                  render={({ field }) => (
                    <SelectInputForm
                      placeholder="Seleccionar destino"
                      error={errors?.destination}
                      field={field}
                      options={
                        locationsData?.map((location) => ({
                          id: location.id,
                          value: location.city
                        })) ?? []
                      }
                      loading={loadingLocations}
                      showSearch
                    />
                  )}
                />
              </Flex>

              <Flex vertical className="selectButton">
                <p className={styles.inputTitle}>Origen</p>
                <Controller
                  name="origin"
                  control={control}
                  rules={{ required: "Este campo es requerido" }}
                  render={({ field }) => (
                    <SelectInputForm
                      placeholder="Seleccionar origen"
                      error={errors?.origin}
                      field={field}
                      options={
                        locationsData?.map((location) => ({
                          id: location.id,
                          value: location.city
                        })) ?? []
                      }
                      loading={loadingLocations}
                      showSearch
                    />
                  )}
                />
              </Flex>
            </div>

            {/* Botones de acción */}
            <Flex gap={16} style={{ alignSelf: "flex-end" }}>
              <FooterButtons
                showLeftButton={false}
                titleConfirm={isLoading ? "Guardando..." : "Guardar"}
                isConfirmLoading={isLoading}
                handleOk={handleSaveRate}
              />
            </Flex>
          </Flex>
        </form>
      </div>

      <Modal
        centered
        className="ModalAttachEvidence"
        onCancel={() => setShowEvidenceModal(false)}
        width={"55%"}
        open={isOpenShowEvidenceModal}
        footer={null}
        closable={false}
        destroyOnClose={true}
      >
        <ModalAttachEvidence
          handleAttachEvidence={handleSubmit(onSubmit)}
          selectedEvidence={selectedEvidence}
          setSelectedEvidence={setSelectedEvidence}
          commentary={commentary}
          setCommentary={setCommentary}
          setShowEvidenceModal={setShowEvidenceModal}
          handleCancel={() => {
            setShowEvidenceModal(false);
            setSelectedEvidence([]);
            setCommentary("");
          }}
          customTexts={{
            description: "Adjuntar evidencia"
          }}
          loading={isLoading}
          multipleFiles={false}
        />
      </Modal>
    </div>
  );
}
