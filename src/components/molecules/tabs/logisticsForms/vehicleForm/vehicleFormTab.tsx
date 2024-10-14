import { useEffect, useState } from "react";
import { Button, Col, Flex, Row, Switch, Typography, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { ArrowsClockwise, CaretLeft, Pencil } from "phosphor-react";

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
import { UploadDocumentButton } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import UploadDocumentChild from "@/components/atoms/UploadDocumentChild/UploadDocumentChild";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import SubmitFormButton from "@/components/atoms/SubmitFormButton/SubmitFormButton";
import LoadDocumentsButton from "@/components/atoms/LoadDocumentsButton/LoadDocumentsButton";
import { SelectInputForm } from "@/components/molecules/logistics/SelectInputForm/SelectInputForm";

const { Title, Text } = Typography;

interface ImageState {
  file: File | undefined;
}

export const VehicleFormTab = ({
  data,
  handleFormState = () => {},
  onEditVehicle = () => {},
  onSubmitForm = () => {},
  statusForm = "review",
  onActiveVehicle = () => {},
  onDesactivateVehicle = () => {},
  params,
  documentsTypesList,
  vehiclesTypesList,
  isLoading
}: VehicleFormTabProps) => {
  const [isOpenModal, setIsOpenModal] = useState(false);

  const [isOpenModalDocuments, setIsOpenModalDocuments] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [hasGPS, setHasGPS] = useState(data?.has_gps || false);

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
    getValues,
    trigger,
    formState: { errors, isValid }
  } = useForm<IFormVehicle>({
    defaultValues,
    disabled: statusForm === "review",
    mode: "onChange"
  });

  const { push } = useRouter();
  const formImages = watch("images");

  const hasImages = () => {
    return images.some((img) => img.file) || (formImages && formImages.length > 0);
  };
  const isFormCompleted = () => {
    return isValid && hasImages();
  };
  const isSubmitButtonEnabled = isFormCompleted() && !isLoading;

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
  const [files, setFiles] = useState<FileObject[] | any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<DocumentCompleteType[]>([]);

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
        const docsWithLink =
          documentsTypesList
            ?.filter((f) => data?.documents?.find((d) => d.id_document_type === f.id))
            .map((f) => ({
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
    const hasImage = data.images.length > 0;
    if (!hasImage) {
      setImageError(true);
      return;
    }
    const vehicleData: any = {
      ...data.general,
      has_gps: hasGPS,
      id_carrier: Number(params.id) || 14
    };
    const formImages = [...data.images];
    _onSubmitVehicle(vehicleData, selectedFiles, formImages, setImageError, onSubmitForm);
    setImages(Array(5).fill({ file: undefined }));
  };

  const convertToSelectOptions = (vehicleTypes: VehicleType[]) => {
    console.log("convertToSelectOptions vehicleTypes", vehicleTypes);
    const newValues = vehicleTypes?.map((vehicleType) => ({
      value: vehicleType.description,
      id: Number(vehicleType.id)
    }));
    console.log("convertToSelectOptions newValues", newValues);
    return newValues;
  };

  return (
    <>
      <form className="vehiclesFormTab" onSubmit={handleSubmit(onSubmit)}>
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
          <Flex gap={"1rem"}>
            {statusForm === "review" && (
              <Button
                className="buttons"
                htmlType="button"
                disabled={statusForm === "review"}
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpenModal(true);
                }}
              >
                Cambiar Estado
                <ArrowsClockwise size={"1.2rem"} />
              </Button>
            )}
            {statusForm === "review" ? (
              <Button
                className="buttons -edit"
                htmlType="button"
                onClick={(e) => {
                  handleFormState("edit");
                  e.preventDefault();
                }}
              >
                {validationButtonText(statusForm)}
                <Pencil size={"1.2rem"} />
              </Button>
            ) : (
              ""
            )}
            {statusForm === "edit" ? (
              <Button
                className="buttons -edit"
                htmlType="button"
                onClick={(e) => {
                  handleFormState("review");
                  e.preventDefault();
                  reset();
                  setHasGPS(data?.has_gps || false);
                }}
              >
                {"Cancelar edición"}
              </Button>
            ) : (
              ""
            )}
          </Flex>
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
                    error={undefined}
                    // error={errors.general?.year}
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
            <Row style={{ marginTop: "1rem", width: "100%" }}>
              {selectedFiles.map((file, index) => (
                <Col
                  span={12}
                  key={`file-${file.id}`}
                  style={{ marginBottom: "16px", paddingRight: index % 2 === 0 ? "16px" : "0" }}
                >
                  <UploadDocumentButton
                    key={file.id}
                    title={file.description}
                    isMandatory={!file.optional}
                    aditionalData={file.id}
                    setFiles={() => {}}
                    files={file.file}
                    disabled
                  >
                    {file?.link ? (
                      <UploadDocumentChild
                        linkFile={file.link}
                        nameFile={file.link.split("-").pop() ?? ""}
                        onDelete={() => {}}
                        showTrash={false}
                      />
                    ) : undefined}
                  </UploadDocumentButton>
                </Col>
              ))}
            </Row>
          </Row>
          {["edit", "create"].includes(statusForm) && (
            <Row justify={"end"}>
              <SubmitFormButton
                text={validationButtonText(statusForm)}
                disabled={!isSubmitButtonEnabled}
                onClick={handleSubmit(onSubmit)}
                loading={isLoading}
              />
            </Row>
          )}
        </Flex>
      </form>
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
