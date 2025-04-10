import { useEffect, useState } from "react";
import { Button, Col, Dropdown, Flex, Form, MenuProps, Row, Switch, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";
import { ArrowsClockwise, CaretLeft, CheckCircle, Pencil } from "phosphor-react";
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
import { IFormVehicle, VehicleType } from "@/types/logistics/schema";
import ModalDocuments from "@/components/molecules/modals/ModalDocuments/ModalDocuments";
import { DocumentCompleteType } from "@/types/logistics/certificate/certificate";
import Link from "next/link";
import dayjs from "dayjs";
import SubmitFormButton from "@/components/atoms/SubmitFormButton/SubmitFormButton";
import LoadDocumentsButton from "@/components/atoms/LoadDocumentsButton/LoadDocumentsButton";
import { SelectInputForm } from "@/components/molecules/logistics/SelectInputForm/SelectInputForm";
import ModalConfirmAudit from "../driverForm/components/ModalConfirmAudit";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import CustomTag from "@/components/atoms/CustomTag";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import React from "react";
import MultiSelectTags from "@/components/ui/multi-select-tags/MultiSelectTags";
import { DocumentsTable } from "@/components/molecules/tables/logistics/documentsTable/DocumentsTable";

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
  console.log("dataGENERAL", data);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenModalDocuments, setIsOpenModalDocuments] = useState(false);
  const [isModalConfirmAuditOpen, setIsModalConfirmAuditOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [hasGPS, setHasGPS] = useState(data?.has_gps || false);
  const [files, setFiles] = useState<FileObject[] | any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<DocumentCompleteType[]>([]);

  const [images, setImages] = useState<ImageState[]>(
    Array(5).fill({ file: undefined, error: false })
  );
  const defaultValues = statusForm === "create" ? {} : normalizeVehicleData(data as any);
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

  const formImages = watch("images");

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <ButtonGenerateAction
          icon={<Pencil size={"1.5rem"} />}
          title={statusForm === "review" ? "Editar" : "Cancelar edición"}
          hideArrow
          onClick={() => {
            if (statusForm === "review") {
              handleFormState("edit");
            } else {
              handleFormState("review");
              reset();
            }
          }}
        />
      )
    },
    {
      key: "2",
      label: (
        <ButtonGenerateAction
          icon={<ArrowsClockwise size={"1.5rem"} />}
          title="Cambiar estado"
          onClick={() => setIsOpenModal(true)}
          hideArrow
        />
      )
    },
    {
      key: "3",
      label: (
        <ButtonGenerateAction
          icon={<CheckCircle size={"1.5rem"} />}
          title="Auditar"
          disabled={statusForm !== "review"}
          hideArrow
          onClick={() => setIsModalConfirmAuditOpen(true)}
        />
      )
    }
  ];
  const menuStyle: React.CSSProperties = {
    backgroundColor: "white",
    boxShadow: "none"
  };
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
  interface FileObject {
    docReference: string;
    file: File | undefined;
  }

  const trip_type = watch("general.trip_type");
  const driverStatus = watch("general.status");

  useEffect(() => {
    if (Array.isArray(documentsTypesList)) {
      const isFirstLoad = data?.documents?.length && selectedFiles.length === 0;
      if (isFirstLoad) {
        const docsWithLink =
          documentsTypesList
            ?.filter((f) => data.documents?.find((d) => d.id_document_type === f.id))
            .map((f) => ({
              ...f,
              file: undefined,
              link: data.documents?.find((d) => d.id_document_type === f.id)?.url_archive,
              expirationDate: dayjs(
                data.documents?.find((d) => d.id_document_type === f.id)?.expiration_date
              )
            })) || [];
        setSelectedFiles(docsWithLink);
      } else {
        const documentsFiltered = documentsTypesList?.filter(
          (f) => !f?.optional || selectedFiles?.find((f2) => f2.id === f.id)
        );
        const docsWithFile = documentsFiltered.map((f) => {
          const prevFile = selectedFiles.find((f2) => f2.id === f.id);
          return {
            ...f,
            link: prevFile?.link || undefined,
            file: prevFile?.link ? undefined : files.find((f2) => f2.aditionalData === f.id)?.file,
            expirationDate: prevFile?.expirationDate
          };
        });
        if (docsWithFile?.length) {
          setSelectedFiles([...docsWithFile]);
        } else {
          setSelectedFiles([]);
        }
      }
    }
  }, [files, documentsTypesList]);

  useEffect(() => {
    if (statusForm === "review") {
      if (Array.isArray(documentsTypesList)) {
        const documentsFromData = documentsTypesList?.filter((f) =>
          data?.documents?.find((d) => d.id_document_type === f.id)
        );
        const nonOptionalDocuments = documentsTypesList.filter((f) => !f?.optional);
        const documentsUniqueSet = new Set([...documentsFromData, ...nonOptionalDocuments]);
        const documentsUniqueArray = Array.from(documentsUniqueSet);
        const docsWithLink =
          documentsUniqueArray.map((f) => ({
            ...f,
            file: undefined,
            link: data?.documents?.find((d) => d.id_document_type === f.id)?.url_archive,
            expirationDate: dayjs(
              data?.documents?.find((d) => d.id_document_type === f.id)?.expiration_date
            )
          })) || [];
        setSelectedFiles(docsWithLink);
      }
    }
  }, [statusForm]);

  const handleChangeExpirationDate = (index: number, value: any) => {
    setSelectedFiles((prevState: any[]) => {
      const updatedFiles = [...prevState];
      updatedFiles[index].expirationDate = value;
      return updatedFiles;
    });
  };

  const handleChange = (value: string[]) => {
    const sf = documentsTypesList?.filter((file) => value.includes(file.id.toString()));
    if (sf) {
      setSelectedFiles((prevState) => {
        return sf.map((file) => {
          const prevFile = prevState.find((f) => f.id === file.id);
          return {
            ...file,
            file: prevFile?.link ? undefined : prevFile?.file,
            link: prevFile?.link || undefined,
            expirationDate: prevFile?.expirationDate
          };
        });
      });
    }
  };

  const onSubmit = async (data: any) => {
    const vehicleData: any = {
      ...data.general,
      has_gps: hasGPS,
      id_carrier: Number(params.id) || 14,
      features: data.general.trip_type.map((tripType: any) => ({
        id: tripType.value
      }))
    };
    const formImages = [...data.images];
    _onSubmitVehicle(vehicleData, selectedFiles, formImages, setImageError, onSubmitForm);
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
                {!!driverStatus?.description && (
                  <CustomTag text={driverStatus.description} color={driverStatus.color} />
                )}
              </Flex>
              <Dropdown
                menu={{ items }}
                trigger={["click"]}
                dropdownRender={(menu) => (
                  <div>
                    {React.cloneElement(
                      menu as React.ReactElement<{
                        style: React.CSSProperties;
                      }>,
                      { style: menuStyle }
                    )}
                  </div>
                )}
              >
                <GenerateActionButton onClick={() => {}} />
              </Dropdown>
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
            <Col span={8}>
              <Title className="title" level={4}>
                Documentos
              </Title>
            </Col>
            <Col span={8} offset={8} style={{ display: "flex", justifyContent: "flex-end" }}>
              {(statusForm === "create" || statusForm === "edit") && (
                <LoadDocumentsButton
                  text="Cargar documentos"
                  onClick={() => setIsOpenModalDocuments(true)}
                />
              )}
            </Col>
            <DocumentsTable selectedFiles={selectedFiles} />
          </Row>
          {["edit", "create"].includes(statusForm) && (
            <Row justify={"end"}>
              <SubmitFormButton
                loading={isLoading}
                disabled={isLoading} // Solo lo deshabilitas mientras está cargando
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
      <ModalConfirmAudit
        isOpen={isModalConfirmAuditOpen}
        onClose={() => setIsModalConfirmAuditOpen(false)}
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
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        onActive={onActiveVehicle}
        onDesactivate={onDesactivateVehicle}
      />
      <ModalDocuments
        isOpen={isOpenModalDocuments}
        mockFiles={selectedFiles}
        setFiles={setFiles}
        documentsType={documentsTypesList}
        isLoadingDocuments={false}
        onClose={() => setIsOpenModalDocuments(false)}
        handleChange={handleChange}
        handleChangeExpirationDate={handleChangeExpirationDate}
        setSelectedFiles={setSelectedFiles}
      />
    </>
  );
};
