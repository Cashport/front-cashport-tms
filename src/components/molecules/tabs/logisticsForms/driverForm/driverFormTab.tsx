import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
// components
import { Button, Col, Dropdown, Flex, Form, MenuProps, Row, Typography } from "antd";
import { ModalChangeStatus } from "@/components/molecules/modals/ModalChangeStatus/ModalChangeStatus";
import { UploadImg } from "@/components/atoms/UploadImg/UploadImg";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import MultiSelectTags from "@/components/ui/multi-select-tags/MultiSelectTags";
import InputPhone from "@/components/atoms/inputs/InputPhone/InputPhone";
import { InputDateForm } from "@/components/atoms/inputs/InputDate/InputDateForm";
import { FileObject } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";

import SubmitFormButton from "@/components/atoms/SubmitFormButton/SubmitFormButton";
import LoadDocumentsButton from "@/components/atoms/LoadDocumentsButton/LoadDocumentsButton";
import { SelectInputForm } from "@/components/molecules/logistics/SelectInputForm/SelectInputForm";
import ModalDocuments from "@/components/molecules/modals/ModalDocuments/ModalDocuments";
import Link from "next/link";
//types
import { IFormDriver, VehicleType } from "@/types/logistics/schema";
import { DocumentCompleteType } from "@/types/logistics/certificate/certificate";
//icons
import { ArrowsClockwise, CaretLeft, CheckCircle, Pencil } from "phosphor-react";
//utils
import {
  _onSubmit,
  dataToProjectFormData,
  validationButtonText,
  DriverFormTabProps
} from "./driverFormTab.mapper";
import {
  bloodTypesOptions,
  documentTypesOptions,
  glassesOptions,
  licencesOptions
} from "../formSelectOptions";
import runes from "runes2";
import CustomTag from "@/components/atoms/CustomTag";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";

import ModalConfirmAudit from "./components/ModalConfirmAudit";

//styles
import "./driverformtab.scss";
import { DocumentsTable } from "@/components/molecules/tables/logistics/documentsTable/DocumentsTable";

const { Title, Text } = Typography;

export const DriverFormTab = ({
  onEditProject = () => {},
  onSubmitForm = () => {},
  statusForm = "review",
  data,
  onActiveProject = async () => {},
  onDesactivateProject = async () => {},
  params,
  handleFormState = () => {},
  documentsTypesList,
  vehiclesTypesList,
  isLoadingSubmit,
  tripTypes,
  onAuditDriver = async () => {}
}: DriverFormTabProps) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenModalDocuments, setIsOpenModalDocuments] = useState(false);
  const [isModalConfirmAuditOpen, setIsModalConfirmAuditOpen] = useState(false);

  const [imageFile, setImageFile] = useState<any | undefined>(undefined);
  const [resetTrigger, setResetTrigger] = useState<boolean>(false);
  const [imageError, setImageError] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<DocumentCompleteType[]>([]);

  const defaultValues =
    statusForm === "create" ? {} : dataToProjectFormData(data, vehiclesTypesList || []);
  const {
    watch,
    getValues,
    control,
    handleSubmit,
    reset,
    formState: { errors },
    trigger
  } = useForm<IFormDriver>({
    defaultValues,
    disabled: statusForm === "review",
    mode: "onChange"
  });

  const phoneValue = watch("general.phone");
  const driverStatus = watch("general.status");
  const trip_type = watch("general.trip_type");

  console.log("form general", getValues("general"));
  const emergencyContactNumberValue = watch("general.emergency_number");

  /*archivos*/
  useEffect(() => {
    if (phoneValue?.toString()?.length > 0) {
      trigger("general.phone");
    }
    if (emergencyContactNumberValue?.toString()?.length > 0) {
      trigger("general.emergency_number");
    }
  }, [phoneValue, emergencyContactNumberValue]);

  const [files, setFiles] = useState<(FileObject & { aditionalData?: any })[]>([]);

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

  const convertToSelectOptions = (vehicleTypes: VehicleType[]) => {
    if (!Array.isArray(vehicleTypes)) return [];
    return vehicleTypes?.map((vehicleType) => ({
      label: vehicleType.description,
      value: vehicleType.id
    }));
  };

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

  const onSubmit = (data: any) => {
    setResetTrigger(false);
    data.general.license_categorie = licencesOptions.find(
      (item) =>
        item.id === data.general.license_category || item.value === data.general.license_category
    )?.value;
    data.general.rhval = bloodTypesOptions.find(
      (item) => item.id === data.general.rh || item.value === data.general.rh
    )?.value;
    data.general.vehicle_type = data.general.vehicle_type.map((v: any) => v.value);
    _onSubmit(
      data,
      selectedFiles,
      imageFile ? [{ docReference: "imagen", file: imageFile }] : undefined,
      onSubmitForm
    );
  };
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
              setResetTrigger(true);
              setImageFile(undefined);
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

  useEffect(() => {
    if (imageFile) {
      setImageError(false); // Limpia el error si se carga una imagen
    }
  }, [imageFile]);

  return (
    <>
      <Form className="driverForm">
        <Flex component={"header"} className="headerProyectsForm">
          <Link href={`/logistics/providers/${params.id}/driver`} passHref>
            <Button
              type="text"
              size="large"
              className="buttonGoBack"
              icon={<CaretLeft size={"1.45rem"} />}
            >
              Ver Conductores
            </Button>
          </Link>
          {statusForm !== "create" && (
            <Flex gap={"0.5rem"} align="center">
              <Flex>
                <CustomTag text={driverStatus.description} color={driverStatus.color} />
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
                <GenerateActionButton
                  onClick={() => {
                    console.log("click");
                  }}
                  disabled={statusForm === "review"}
                />
              </Dropdown>
            </Flex>
          )}
        </Flex>
        <Flex component={"main"} flex="1" vertical style={{ paddingRight: "1rem" }}>
          <Row gutter={16}>
            <Col span={5}>
              {" "}
              {/* Columna Foto de conductor*/}
              <Title className="title" level={4}>
                Foto de conductor
              </Title>
              <UploadImg
                disabled={statusForm === "review"}
                imgDefault={
                  watch("general.photo") ??
                  "https://cdn.icon-icons.com/icons2/1622/PNG/512/3741756-bussiness-ecommerce-marketplace-onlinestore-store-user_108907.png"
                }
                setImgFile={setImageFile}
                uploadInstructionsText="*Sube la foto del conductor"
                resetTrigger={resetTrigger}
              />
              {imageError && (
                <Text className="textError">{"foto del conductor es obligatorio *"}</Text>
              )}
            </Col>
            <Col span={19}>
              {" "}
              {/* Columna Informacion general*/}
              <Title className="title" level={4}>
                Información General
              </Title>
              <Row gutter={[16, 16]}>
                {" "}
                {/* Fila campos info gral*/}
                <Col span={8}>
                  <InputForm
                    titleInput="Nombres"
                    nameInput="general.name"
                    control={control}
                    error={errors?.general?.name}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    titleInput="Apellidos"
                    nameInput="general.last_name"
                    control={control}
                    error={errors?.general?.last_name}
                  />
                </Col>
                <Col span={8}>
                  <Flex vertical className="selectButton">
                    <Title className="title" level={5}>
                      Tipo de Sangre
                    </Title>
                    <Controller
                      name="general.rh"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <SelectInputForm
                          placeholder="Selecciona Tipo de Sangre"
                          error={errors?.general?.rh}
                          field={field}
                          options={bloodTypesOptions}
                        />
                      )}
                    />
                  </Flex>
                </Col>
                <Col span={8}>
                  <Flex vertical className="selectButton">
                    <InputDateForm
                      titleInput="Fecha de nacimiento"
                      nameInput="general.birth_date"
                      placeholder="Seleccionar fecha de nacimiento"
                      disabled={statusForm === "review"}
                      control={control}
                      error={errors?.general?.birth_date}
                    />
                  </Flex>
                </Col>
                <Col span={8}>
                  <Flex vertical className="selectButton">
                    <Title className="title" level={5}>
                      Tipo de documento
                    </Title>
                    <Controller
                      name="general.document_type"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <SelectInputForm
                          placeholder="Selecciona Tipo de documento"
                          error={errors?.general?.document_type}
                          field={field}
                          options={documentTypesOptions}
                        />
                      )}
                    />
                  </Flex>
                </Col>
                <Col span={8}>
                  <InputForm
                    titleInput="Numero de documento"
                    nameInput="general.document"
                    control={control}
                    error={errors?.general?.document}
                  />
                </Col>
                <Col span={8}>
                  <InputPhone
                    name="general.phone"
                    control={control}
                    titleInput="Teléfono"
                    placeholder="Ingrese un teléfono"
                    error={errors?.general?.phone}
                    validationRules={{
                      required: "El número de teléfono es obligatorio",
                      minLength: {
                        value: 10,
                        message: "El número debe tener al menos 10 dígitos"
                      },
                      maxLength: {
                        value: 10,
                        message: "El número no puede tener más de 10 dígitos"
                      }
                    }}
                    count={{
                      show: statusForm !== "review",
                      max: 10,
                      strategy: (txt: any) => runes(txt).length,
                      exceedFormatter: (txt: any, { max }: { max: number }): string => {
                        return runes(txt).slice(0, max).join("");
                      }
                    }}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    titleInput="Correo"
                    nameInput="general.email"
                    control={control}
                    error={errors?.general?.email}
                  />
                </Col>
                <Col span={8}>
                  <Flex vertical className="selectButton">
                    <Title className="title" level={5}>
                      Usas lentes
                    </Title>
                    <Controller
                      name="general.glasses"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <SelectInputForm
                          placeholder="Selecciona"
                          error={errors?.general?.glasses}
                          field={field}
                          options={glassesOptions}
                          selected={watch("general.glasses")}
                        />
                      )}
                    />
                  </Flex>
                </Col>
              </Row>
              <Title className="title" level={4} style={{ marginTop: "1rem" }}>
                Datos de la licencia
              </Title>
              <Row gutter={[16, 16]}>
                {" "}
                {/* Fila Datos de la licencia*/}
                <Col span={8}>
                  <InputForm
                    titleInput="Licencia"
                    nameInput="general.license"
                    control={control}
                    error={errors?.general?.license}
                  />
                </Col>
                <Col span={8}>
                  <Flex vertical className="selectButton">
                    <Title className="title" level={5}>
                      Categoria
                    </Title>
                    <Controller
                      name="general.license_category"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <SelectInputForm
                          placeholder="Selecciona categoria de la licencia"
                          error={errors?.general?.license_category}
                          field={field}
                          options={licencesOptions}
                        />
                      )}
                    />
                  </Flex>
                </Col>
                <Col span={8}>
                  <Flex vertical className="selectButton">
                    <InputDateForm
                      titleInput="Fecha de expiración"
                      nameInput="general.license_expiration"
                      placeholder="Seleccionar fecha de expiración"
                      disabled={statusForm === "review"}
                      control={control}
                      validationRules={{ required: true }}
                      error={errors?.general?.license_expiration}
                    />
                  </Flex>
                </Col>
              </Row>
            </Col>
          </Row>
          {/* ----------------------------------Vehiculos--------------------------------- */}
          <Row style={{ width: "100%", marginTop: "2rem" }}>
            <Title className="title" level={4}>
              Vehículos
            </Title>
            <Controller
              name="general.vehicle_type"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <MultiSelectTags
                  field={field}
                  placeholder="Seleccione vehículos"
                  title="Vehículos que está autorizados a manejar"
                  errors={errors?.general?.vehicle_type}
                  options={convertToSelectOptions(vehiclesTypesList || [])}
                  disabled={statusForm === "review"}
                />
              )}
            />
          </Row>
          {/* ----------------------------------Tipos de viaje--------------------------------- */}
          <Row style={{ width: "100%", marginTop: "2rem" }}>
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
                  options={tripTypes.map((tripType) => ({
                    label: tripType.description,
                    value: tripType.id
                  }))}
                  disabled={statusForm === "review"}
                />
              )}
            />
          </Row>
          {/* -----------------------------------Contact----------------------------------- */}
          <Row style={{ width: "100%", marginTop: "2rem" }}>
            <Col span={24}>
              <Title className="title" level={4}>
                Datos de Contacto
              </Title>
              <Row gutter={[16, 16]}>
                <Col span={6}>
                  <InputForm
                    titleInput="Nombres y apellidos"
                    nameInput="general.emergency_contact"
                    control={control}
                    error={errors?.general?.emergency_contact}
                  />
                </Col>
                <Col span={6}>
                  <InputPhone
                    name="general.emergency_number"
                    control={control}
                    titleInput="Teléfono"
                    placeholder="Ingrese un teléfono"
                    error={errors?.general?.emergency_number}
                    validationRules={{
                      required: "Obligatorio",
                      minLength: {
                        value: 10,
                        message: "El número debe tener al menos 10 dígitos"
                      },
                      maxLength: {
                        value: 10,
                        message: "El número no puede tener más de 10 dígitos"
                      }
                    }}
                    count={{
                      show: statusForm !== "review",
                      max: 10,
                      strategy: (txt: any) => runes(txt).length,
                      exceedFormatter: (txt: any, { max }: { max: number }): string => {
                        return runes(txt).slice(0, max).join("");
                      }
                    }}
                  />
                </Col>
              </Row>
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
                loading={isLoadingSubmit}
                disabled={isLoadingSubmit}
                text={validationButtonText(statusForm)}
                onClick={async () => {
                  const hasPhoto = !!imageFile || !!getValues("general.photo");
                  if (!hasPhoto) {
                    setImageError(true);
                  }
                  const isValidForm = await trigger();
                  if (isValidForm) {
                    handleSubmit(onSubmit)();
                  }
                }}
              />
            </Row>
          )}
        </Flex>
      </Form>
      <ModalChangeStatus
        isActiveStatus={watch("general.active")}
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        onActive={async () => {
          await onActiveProject();
          setIsOpenModal(false);
          handleFormState("review");
        }}
        onDesactivate={async () => {
          await onDesactivateProject();
          setIsOpenModal(false);
          handleFormState("review");
        }}
      />
      <ModalConfirmAudit
        isOpen={isModalConfirmAuditOpen}
        onClose={() => setIsModalConfirmAuditOpen(false)}
        onConfirm={onAuditDriver}
        title="Auditar conductor"
        description={[
          "¿Confirma que el vehículo cumple con los requerimientos legales y de HSEQ?",
          "Confirmo que está autorizado para manejar"
        ]}
        tags={trip_type}
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
