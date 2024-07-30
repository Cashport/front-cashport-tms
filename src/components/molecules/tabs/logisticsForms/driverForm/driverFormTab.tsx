import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Flex,
  Form,
  Row,
  Select,
  Typography
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { ArrowsClockwise, CaretLeft, Pencil } from "phosphor-react";

// components
import { ModalChangeStatus } from "@/components/molecules/modals/ModalChangeStatus/ModalChangeStatus";
import { UploadImg } from "@/components/atoms/UploadImg/UploadImg";

import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";

import "./driverformtab.scss";
import {
  _onSubmit,
  dataToProjectFormData,
  validationButtonText,
  DriverFormTabProps,
  DriverData
} from "./driverFormTab.mapper";
import {  IFormDriver, VehicleType } from "@/types/logistics/schema";
import { InputDateForm } from "@/components/atoms/inputs/InputDate/InputDateForm";

import { UploadDocumentButton } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";

import useSWR from "swr";
import { getDocumentsByEntityType } from "@/services/logistics/certificates";
import { DocumentCompleteType } from "@/types/logistics/certificate/certificate";
import ModalDocuments from "@/components/molecules/modals/ModalDocuments/ModalDocuments";
import { getVehicleType } from "@/services/logistics/vehicle";
import Link from "next/link";
import dayjs from "dayjs";
import UploadDocumentChild from "@/components/atoms/UploadDocumentChild/UploadDocumentChild";
import SubmitFormButton from "@/components/atoms/SubmitFormButton/SubmitFormButton";
import LoadDocumentsButton from "@/components/atoms/LoadDocumentsButton/LoadDocumentsButton";
import { SelectInputForm } from "@/components/molecules/logistics/SelectInputForm/SelectInputForm";
import { bloodTypesOptions, documentTypesOptions, glassesOptions, licencesOptions } from "../formSelectOptions";
import SelectOuterTagsLogistics from "@/components/ui/select-outer-tags-logistics/select-outer-tags-logistics";

const { Title, Text } = Typography;

export const DriverFormTab = ({
  onEditProject = () => {},
  onSubmitForm = () => {},
  statusForm = "review",
  data = [] as DriverData[],
  onActiveProject = () => {},
  onDesactivateProject = () => {},
  params
}: DriverFormTabProps) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenModalDocuments, setIsOpenModalDocuments] = useState(false);
  const { data: documentsType, isLoading: isLoadingDocuments } = useSWR(
    "2",
    getDocumentsByEntityType
  );

  const { data: vehiclesTypesData, isLoading: loadingVicles } = useSWR(
    "/vehicle/type",
    getVehicleType
  );

  const [imageFile, setImageFile] = useState<any | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<DocumentCompleteType[]>([]);

  const defaultValues = statusForm === "create" ? {} : dataToProjectFormData(data[0]);
  const {
    watch,
    setValue,
    getValues,
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid}
  } = useForm<IFormDriver>({
    defaultValues,
    disabled: statusForm === "review"
  });
  const isFormCompleted = () => {
    return isValid && imageFile
  }
  const isSubmitButtonEnabled = isFormCompleted() && !loading
  /*archivos*/
  interface FileObject {
    docReference: string;
    file: File | undefined;
  }
  const [files, setFiles] = useState<(FileObject & { aditionalData?: any })[]>([]);

  useEffect(() => {
    if (Array.isArray(documentsType)) {
      if (data[0]?.documents?.length) {
        const fileSelected =
          documentsType
            ?.filter((f) => data[0].documents?.find((d) => d.id_document_type === f.id))
            .map((f) => ({
              ...f,
              file: undefined,
              link: data[0].documents?.find((d) => d.id_document_type === f.id)?.url_archive,
              expirationDate: dayjs(
                data[0].documents?.find((d) => d.id_document_type === f.id)?.expiration_date
              )
            })) || [];
        console.log(fileSelected);
        setSelectedFiles(fileSelected);
      } else {
        const fileSelected = documentsType
          ?.filter(
            (f) => !f?.optional || selectedFiles?.find((f2) => f2.id === f.id)
          )
          ?.map((f) => ({
            ...f,
            file: files.find((f2) => f2.aditionalData === f.id)?.file,
            expirationDate: selectedFiles.find((f2) => f2.id === f.id)?.expirationDate
          }));
        console.log(fileSelected);
        if (fileSelected?.length) {
          setSelectedFiles([...fileSelected]);
        } else {
          setSelectedFiles([]);
        }
      }
    }
  }, [files, documentsType]);

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
    const sf = documentsType?.filter((file) => value.includes(file.id.toString()));
    if (sf) {
      setSelectedFiles((prevState) => {
        return sf.map((file) => ({
          ...file,
          file: prevState.find((f) => f.id === file.id)?.file,
          expirationDate: prevState.find((f) => f.id === file.id)?.expirationDate
        }));
      });
    }
  };

  const onSubmit = (data: any) => {
    data.general.license_categorie = licencesOptions.find(
      (item) => item.id === data.general.license_category
    )?.value;
    data.general.rhval = bloodTypesOptions.find((item) => item.id === data.general.rh)?.value;
    data.general.vehicle_type = data.general.vehicle_type.map((v:any)=>v.value)
    _onSubmit(
      data,
      setLoading,
      setImageError,
      imageFile ? [{ docReference: "imagen", file: imageFile }] : undefined,
      selectedFiles,
      onSubmitForm,
      reset
    );
  };

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
          <Flex gap={"1rem"}>
            {(statusForm === "review" || statusForm === "edit") && (
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
                disabled={statusForm === "review"} 
                onClick={(e) => {
                  e.preventDefault();
                  onEditProject();
                }}
              >
                {validationButtonText(statusForm)}
                <Pencil size={"1.2rem"} />
              </Button>
            ) : (
              ""
            )}
          </Flex>
        </Flex>
        <Flex component={"main"} flex="1" vertical style={{paddingRight: "1rem"}}>
          <Row gutter={16}> 
            <Col span={5}> {/* Columna Foto de conductor*/}
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
              />
              {imageError && (
                <Text className="textError">{"foto del conductor es obligatorio *"}</Text>
              )}
            </Col>
            <Col span={19}> {/* Columna Informacion general*/}
              <Title className="title" level={4}>
                  Información General
              </Title>
              <Row gutter={[16,16]}> {/* Fila campos info gral*/}
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
                      render={({ field }) => 
                        <SelectInputForm
                        placeholder="Selecciona Tipo de Sangre"
                        error={errors?.general?.rh}
                        field={field}
                        options={bloodTypesOptions}
                        />
                      }
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
                      render={({ field }) =>              
                      <SelectInputForm
                        placeholder="Selecciona Tipo de documento"
                        error={errors?.general?.document_type}
                        field={field}
                        options={documentTypesOptions}
                      />}
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
                  <InputForm
                    titleInput="Telefono"
                    nameInput="general.phone"
                    control={control}
                    error={errors?.general?.phone}
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
                        />
                      )}
                    />
                  </Flex>
                </Col>
              </Row>
              <Title className="title" level={4} style={{marginTop: "1rem"}}>
                Datos de la licencia
              </Title>
              <Row gutter={[16,16]}>  {/* Fila Datos de la licencia*/}
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
                  render={({ field }) => 
                    <SelectOuterTagsLogistics
                      field={field}
                      placeholder="Seleccione vehiculos"
                      title="Vehículos que está autorizados a manejar"
                      errors={errors?.general?.vehicle_type}
                      options={convertToSelectOptions((vehiclesTypesData?.data as any) || [])}
                      defaultValue={getValues("general.vehicle_type")?.map((i: any) =>
                        i.id_vehicle_type?.toString()
                      )}
                      disabled={statusForm === "review"} 
                    />
                  }
                />
              </Row>
          {/* -----------------------------------Contact----------------------------------- */}
          <Row style={{ width: "100%", marginTop: "2rem" }}>
            <Col span={24}>
              <Title className="title" level={4}>
                Datos de Contacto
              </Title>
              <Row gutter={[16,16]}> 
                <Col span={6}>
                  <InputForm
                    titleInput="Nombres y apellidos"
                    nameInput="general.emergency_contact"
                    control={control}
                    error={errors?.general?.emergency_contact}
                  />
                </Col>
                <Col span={6}>
                  <InputForm
                    typeInput="tel"
                    titleInput="Telefono"
                    nameInput="general.emergency_number"
                    control={control}
                    error={errors?.general?.emergency_number}
                    validationRules={{
                      pattern: {
                        value: /^\+?\d+$/,
                        message: "Solo se permiten números y un signo '+' al comienzo"
                      }
                    }}
                  />
                </Col>
              </Row>   
            </Col>
          </Row>
          <Row style={{marginTop: "2rem", marginBottom: "2rem"}}> {/* Fila Documentos */}
              <Col span={8}>
                <Title className="title" level={4}>
                  Documentos
                </Title>
              </Col>
              <Col span={8} offset={8} style={{display: "flex", justifyContent: "flex-end"}}>
                {statusForm === "create" && (
                  <LoadDocumentsButton 
                    text="Cargar documentos" 
                    onClick={() => setIsOpenModalDocuments(true)}
                  />
                )}
              </Col>
            <Row style={{marginTop: "1rem", width: "100%"}} >
              {selectedFiles.map((file, index) => (
                <Col span={12} key={`file-${file.id}`}  style={{ marginBottom: "16px", paddingRight: index % 2 === 0 ? "16px" : "0"  }}>
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
            <Row justify={"end"} >
              <SubmitFormButton
                  text={validationButtonText(statusForm)}
                  disabled={!isSubmitButtonEnabled}
                  onClick={handleSubmit(onSubmit)}
                />
            </Row>
          )} 
        </Flex>
      </Form>
      <ModalChangeStatus
        isActiveStatus={true}
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        onActive={onActiveProject}
        onDesactivate={onDesactivateProject}
      />
      <ModalDocuments
        isOpen={isOpenModalDocuments}
        mockFiles={selectedFiles}
        setFiles={setFiles}
        documentsType={documentsType}
        isLoadingDocuments={isLoadingDocuments}
        onClose={() => setIsOpenModalDocuments(false)}
        handleChange={handleChange}
        handleChangeExpirationDate={handleChangeExpirationDate}
      />
    </>
  );
};
