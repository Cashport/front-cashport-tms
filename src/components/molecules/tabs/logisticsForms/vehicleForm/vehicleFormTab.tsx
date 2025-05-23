import { useEffect, useState } from "react";
import { Button, Col, Flex, Form, Row, Switch, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";
import { CaretLeft, Sparkle } from "phosphor-react";
import utc from "dayjs/plugin/utc";

// components
import { ModalChangeStatus } from "@/components/molecules/modals/ModalChangeStatus/ModalChangeStatus";
import { UploadImg } from "@/components/atoms/UploadImg/UploadImg";

//interfaces
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";

import {
  _onSubmitVehicle,
  normalizeVehicleData,
  validationButtonText,
  VehicleFormTabProps
} from "./vehicleFormTab.mapper";
import "./vehicleformtab.scss";
import {
  IFormGeneralVehicle,
  IFormVehicle,
  IProviderDocument,
  VehicleType
} from "@/types/logistics/schema";

import Link from "next/link";
import dayjs from "dayjs";
import SubmitFormButton from "@/components/atoms/SubmitFormButton/SubmitFormButton";
import { SelectInputForm } from "@/components/molecules/logistics/SelectInputForm/SelectInputForm";
import ModalConfirmAudit from "../driverForm/components/ModalConfirmAudit";
import CustomTag from "@/components/atoms/CustomTag";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import React from "react";
import MultiSelectTags from "@/components/ui/multi-select-tags/MultiSelectTags";
import { DocumentsTable } from "@/components/molecules/tables/logistics/documentsTable/DocumentsTable";
import ModalUploadRequirements, {
  IUploadRequirementstTableRow
} from "@/components/organisms/logistics/proveedores/ModalUploadRequirements/ModalUploadRequirements";
import ModalGenerateActionProviders from "@/components/organisms/logistics/proveedores/ModalGenerateActionProviders/ModalGenerateActionProviders";

const { Title, Text } = Typography;

dayjs.extend(utc);
interface ImageState {
  file: File | undefined;
}

export const VehicleFormTab = ({
  data,
  handleFormState = () => {},
  // eslint-disable-next-line no-unused-vars
  onEditVehicle = () => {},
  onSubmitForm = () => {},
  statusForm = "review",
  onActiveVehicle = () => {},
  onDesactivateVehicle = () => {},
  params,
  documentsTypesList,
  vehiclesTypesList,
  features = [],
  isLoading,
  // eslint-disable-next-line no-unused-vars
  onAuditVehicle = () => {}
}: VehicleFormTabProps) => {
  const [isModalOpen, setIsModalOpen] = useState({
    selected: 0
  });
  const [imageError, setImageError] = useState(false);
  const [hasGPS, setHasGPS] = useState(data?.has_gps || false);
  const [currentDocuments, setCurrentDocuments] = useState<IProviderDocument[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<IUploadRequirementstTableRow[]>([]);

  const [images, setImages] = useState<ImageState[]>(
    Array(5).fill({ file: undefined, error: false })
  );
  const defaultValues = statusForm === "create" ? {} : data && normalizeVehicleData(data);
  const {
    watch,
    control,
    handleSubmit,
    resetField,
    reset,
    setValue,
    trigger,
    formState: { errors, isValid }
  } = useForm<IFormVehicle>({
    defaultValues,
    disabled: statusForm === "review",
    mode: "onChange"
  });

  useEffect(() => {
    if (data) {
      setCurrentDocuments(data.documents);
    }
  }, [data]);

  const formImages = watch("images");

  const hasImages = () => {
    return images.some((img) => img.file) || (formImages && formImages.length > 0);
  };

  useEffect(() => {
    if (images.length > 0) {
      setImageError(false); // Limpia el error si se carga una imagen
    }
  }, [images]);

  useEffect(() => {
    if (!hasGPS) {
      resetField("general.gps_user", { defaultValue: "" });
      resetField("general.gps_password", { defaultValue: "" });
      resetField("general.gps_link", { defaultValue: "" });
    }
    trigger(["general.gps_user", "general.gps_password", "general.gps_link"]);
  }, [hasGPS, resetField, trigger]);

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  /*archivos*/

  const trip_type = watch("general.trip_type");
  const driverStatus = watch("general.status");

  const onSubmit = async (data: IFormVehicle) => {
    const vehicleData: IFormGeneralVehicle = {
      ...data.general,
      has_gps: hasGPS,
      id_carrier: Number(params.id) || 14,
      features: data?.general?.trip_type?.map((tripType) => ({
        id: tripType.value
      }))
    };
    const formImages = data.images.map((file) => ({
      file,
      docReference: file.name
    }));

    _onSubmitVehicle(vehicleData, uploadedFiles, formImages, setImageError, onSubmitForm);
    setImages(Array(5).fill({ file: undefined }));
  };

  const convertToSelectOptions = (vehicleTypes: VehicleType[]) => {
    if (!Array.isArray(vehicleTypes)) return [];
    const newValues = vehicleTypes?.map((vehicleType) => ({
      value: vehicleType.description,
      id: Number(vehicleType.id)
    }));
    return newValues;
  };

  useEffect(() => {
    if (data?.id_vehicle_type) {
      setValue("general.id_vehicle_type", data?.id_vehicle_type);
    }
  }, [data, setValue]);

  const handleOpenModal = (modalNumber: number) =>
    setIsModalOpen({
      selected: modalNumber
    });

  return (
    <>
      <Form className="vehiclesFormTab">
        <Flex component={"header"} className="headerProyectsForm">
          <Link href={`/logistics/providers/${params.id}/vehicle`} passHref>
            <Button
              type="text"
              size="large"
              className="buttonGoBack"
              icon={<CaretLeft size={"1.45rem"} />}
            >
              Ver vehículos
            </Button>
          </Link>
          {statusForm !== "create" && (
            <Flex gap={"0.5rem"} align="center">
              <Flex>
                {!!driverStatus?.name && (
                  <CustomTag text={driverStatus.name} color={driverStatus.color} />
                )}
              </Flex>

              <GenerateActionButton
                onClick={() => {
                  setIsModalOpen({ selected: 1 });
                }}
              />
            </Flex>
          )}
        </Flex>
        <Flex component={"main"} flex="3" vertical>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              {" "}
              {/* Columna Fotos del Vehiculo */}
              <Title className="title" level={4}>
                Fotos de vehículo
              </Title>
              {/* ------------Image Project-------------- */}
              <Row>
                <Col span={24} className="colfoto">
                  <UploadImg
                    disabled={statusForm === "review"}
                    imgDefault={formImages ? formImages[0]?.url_archive : undefined}
                    setImgFile={(file) => {
                      const currentUrlArchive = formImages ? formImages[0]?.url_archive : undefined; // obtener el valor actual de url_archive
                      if (currentUrlArchive) {
                        (file as any).url_archive = currentUrlArchive;
                        setValue(`images.${0}`, file);
                      } else {
                        setValue(`images.${0}`, file);
                      }
                      setImages((prev) =>
                        prev.map((img, index) => (index === 0 ? { ...img, file } : img))
                      );
                      if (file) {
                        setImageError(false);
                      }
                    }}
                  />
                  {imageError && (
                    <Text className="textError">{"Al menos 1 imagen debe ser cargada *"}</Text>
                  )}
                </Col>
              </Row>
              <Row gutter={16}>
                {images.slice(1).map((image, index) => (
                  <Col xs={24} sm={12} lg={6} className="colfotomin" key={index + 1}>
                    <UploadImg
                      disabled={statusForm === "review"}
                      imgDefault={formImages ? formImages[index + 1]?.url_archive : undefined}
                      setImgFile={(file) => {
                        const currentUrlArchive = formImages
                          ? formImages[index + 1]?.url_archive
                          : undefined; // obtener el valor actual de url_archive
                        if (currentUrlArchive) {
                          (file as any).url_archive = currentUrlArchive;
                          setValue(`images.${index + 1}`, file);
                        } else {
                          setValue(`images.${index + 1}`, file);
                        }
                        setImages((prev) =>
                          prev.map((img, imgIndex) =>
                            imgIndex === index + 1 ? { ...img, file } : img
                          )
                        );
                        if (file) {
                          setImageError(false);
                        }
                      }}
                    />
                  </Col>
                ))}
              </Row>
            </Col>
            <Col span={18}>
              {" "}
              {/* Columna Informacion general */}
              <Title className="title" level={4}>
                Información General
              </Title>
              <Row gutter={[16, 16]}>
                <Col span={8} className="selectButton">
                  <Title className="title" level={5}>
                    Tipo de vehículo
                  </Title>
                  <Controller
                    name="general.id_vehicle_type"
                    control={control}
                    disabled={statusForm === "review"}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <SelectInputForm
                        placeholder="Selecciona tipo de vehículo"
                        error={errors?.general?.id_vehicle_type}
                        field={field}
                        options={convertToSelectOptions(vehiclesTypesList || [])}
                      />
                    )}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    titleInput="Placa"
                    nameInput="general.plate_number"
                    control={control}
                    disabled={statusForm === "review"}
                    error={errors.general?.plate_number}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    titleInput="Marca"
                    nameInput="general.brand"
                    control={control}
                    disabled={statusForm === "review"}
                    error={errors?.general?.brand}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    titleInput="Modelo"
                    nameInput="general.model"
                    control={control}
                    disabled={statusForm === "review"}
                    error={errors?.general?.model}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    titleInput="Linea"
                    nameInput="general.line"
                    control={control}
                    disabled={statusForm === "review"}
                    error={errors.general?.line}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    titleInput="Año"
                    nameInput="general.year"
                    control={control}
                    disabled={statusForm === "review"}
                    error={errors.general?.year}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    titleInput="Color"
                    nameInput="general.color"
                    control={control}
                    disabled={statusForm === "review"}
                    error={errors.general?.color}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    titleInput="Ciudad"
                    nameInput="general.country"
                    control={control}
                    disabled={statusForm === "review"}
                    error={errors.general?.country}
                  />
                </Col>
              </Row>
              <Flex
                component={"section"}
                className="generalProject"
                justify="flex-start"
                align="center"
                style={{ marginTop: "2rem", marginBottom: "2rem" }}
              >
                <Switch
                  disabled={statusForm === "review"}
                  checked={hasGPS}
                  onChange={() => setHasGPS(!hasGPS)}
                />
                <h5 className="ant-typography input-form-title">&nbsp;&nbsp;Equipado por GPS</h5>
              </Flex>
              <Row gutter={16}>
                <Col span={8}>
                  <InputForm
                    titleInput="Usuario"
                    nameInput="general.gps_user"
                    control={control}
                    disabled={statusForm === "review" || !hasGPS}
                    error={errors.general?.gps_user}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    titleInput="Contraseña"
                    nameInput="general.gps_password"
                    control={control}
                    disabled={statusForm === "review" || !hasGPS}
                    error={errors.general?.gps_password}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    titleInput="Link"
                    nameInput="general.gps_link"
                    control={control}
                    disabled={statusForm === "review" || !hasGPS}
                    error={errors.general?.gps_link}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          {/* ----------------------------------Tipos de viaje--------------------------------- */}
          <Row style={{ width: "100%", marginBottom: "2rem" }}>
            <Title className="title" level={4}>
              Tipos de viaje
            </Title>
            <Controller
              name="general.trip_type"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <MultiSelectTags
                  field={field}
                  placeholder="Seleccione"
                  title="Tipos de viaje que esta autorizado"
                  errors={errors?.general?.trip_type}
                  options={features.map((f) => ({ label: f.description, value: f.id }))}
                  disabled={statusForm === "review"}
                />
              )}
            />
          </Row>
          <Row gutter={[16, 16]}>
            {" "}
            {/* Fila Informacion Adicional */}
            <Col span={24}>
              <Title className="title" level={4}>
                Informacion Adicional
              </Title>
              <InputForm
                placeholder="Escribir información adicional"
                titleInput=""
                nameInput="general.aditional_info"
                control={control}
                validationRules={{ required: false }}
                disabled={statusForm === "review"}
                error={errors.general?.aditional_info}
              />
            </Col>
          </Row>
          <Row style={{ marginTop: "2rem", marginBottom: "2rem" }}>
            {" "}
            {/* Fila Documentos */}
            <Col span={24}>
              <Flex justify="space-between" align="center">
                <Title className="title" level={4}>
                  Documentos
                </Title>

                {statusForm === "create" && (
                  <Button className="iaButton" onClick={() => setIsModalOpen({ selected: -1 })}>
                    <Sparkle size={14} color="#5b21b6" weight="fill" />
                    <span className="textNormal">
                      Carga documentos con{" "}
                      <span
                        className="cashportIATextGradient"
                        style={{
                          fontWeight: 500
                        }}
                      >
                        CashportAI
                      </span>
                    </span>
                  </Button>
                )}
              </Flex>
            </Col>
            <Col span={24} style={{ marginTop: "1.5rem" }}>
              {statusForm === "review" && (
                <DocumentsTable selectedFiles={currentDocuments} subjectId={data?.subject_id} />
              )}
              {statusForm === "create" && (
                <DocumentsTable
                  selectedFiles={uploadedFiles.map(
                    (doc) =>
                      ({
                        name: doc.fileName,
                        description: doc.requirementTypeName,
                        createdAt: undefined,
                        expiryDate: doc.expirationDate
                          ? dayjs(doc.expirationDate).format("YYYY-MM-DD")
                          : undefined,
                        isMandatory: undefined,
                        statusId: "c02b3475-f59a-4222-bb28-9dbb51cf02c1"
                      }) as any
                  )}
                  disableEyeButton
                />
              )}
            </Col>
          </Row>
          {["edit", "create"].includes(statusForm) && (
            <Row justify={"end"}>
              <SubmitFormButton
                loading={isLoading}
                disabled={isLoading}
                text={validationButtonText(statusForm)}
                onClick={async () => {
                  console.log("isvalid", isValid);
                  console.log("error", errors);

                  if (!hasImages()) {
                    setImageError(true);
                  }
                  const isValidForm = await trigger(); // Valida todos los campos manualmente
                  if (isValidForm) {
                    handleSubmit(onSubmit)(); // Solo ejecuta si es válido
                  }
                }}
              />
            </Row>
          )}
        </Flex>
      </Form>
      <ModalGenerateActionProviders
        isOpen={isModalOpen.selected === 1}
        onClose={() => setIsModalOpen({ selected: 0 })}
        handleOpenModal={handleOpenModal}
        statusForm={statusForm}
        handleFormState={handleFormState}
        resetForm={reset}
      />

      <ModalConfirmAudit
        isOpen={isModalOpen.selected === 3}
        onClose={() => setIsModalOpen({ selected: 0 })}
        onConfirm={onAuditVehicle}
        title="Auditar vehículo"
        description={[
          "¿Confirma que el vehículo cumple con los requerimientos legales y de HSEQ?",
          "Confirmo que está autorizado para manejar"
        ]}
        tags={trip_type?.map((tt) => ({
          label: features?.find((f) => f.id === tt.value)?.description || ""
        }))}
      />
      <ModalChangeStatus
        isActiveStatus={true}
        isOpen={isModalOpen.selected === 2}
        onClose={() => setIsModalOpen({ selected: 0 })}
        onActive={onActiveVehicle}
        onDesactivate={onDesactivateVehicle}
      />
      <ModalUploadRequirements
        isOpen={isModalOpen.selected === -1}
        onClose={() => setIsModalOpen({ selected: 0 })}
        documentsTypesList={documentsTypesList}
        onUpload={(data) => {
          setUploadedFiles((prev) => [...prev, ...data.rows]);
        }}
      />
    </>
  );
};
