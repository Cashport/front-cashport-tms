import React, { useEffect, useState } from "react";
import { Button, Col, Dropdown, Flex, Form, MenuProps, Row, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";
import { ArrowsClockwise, CaretLeft, CheckCircle, Pencil } from "phosphor-react";
import Link from "next/link";
import useSWR from "swr";
import dayjs from "dayjs";

import { getDocumentsByEntityType } from "@/services/logistics/certificates";
import { ICarrierById } from "@/services/logistics/carrier";

import { ModalChangeStatus } from "@/components/molecules/modals/ModalChangeStatus/ModalChangeStatus";
import { UploadImg } from "@/components/atoms/UploadImg/UploadImg";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import {
  _onSubmit,
  dataToProjectFormData,
  validationButtonText,
  CarrierFormTabProps
} from "./carrierFormTab.mapper";
import { bloodTypes } from "@/components/molecules/logistics/SelectRh/SelectRh";
import { licences } from "@/components/molecules/logistics/SelectLicenceCategory/SelectLicenceCategory";
import SubmitFormButton from "@/components/atoms/SubmitFormButton/SubmitFormButton";
import LoadDocumentsButton from "@/components/atoms/LoadDocumentsButton/LoadDocumentsButton";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import ModalConfirmAudit from "../driverForm/components/ModalConfirmAudit";
import MultiSelectTags from "@/components/ui/multi-select-tags/MultiSelectTags";
import CustomTag from "@/components/atoms/CustomTag";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import { DocumentsTable } from "@/components/molecules/tables/logistics/documentsTable/DocumentsTable";

import {
  DocumentCompleteType,
  ICertificateAndDocuments
} from "@/types/logistics/certificate/certificate";
import { IFormCarrier } from "@/types/logistics/schema";

import "./carrierformtab.scss";
import { InputSelect } from "@/components/atoms/inputs/InputSelect/InputSelect";
import { useCarrierFormTabTypes } from "./useCarrierFormTabTypes";

const { Title, Text } = Typography;

export const CarrierFormTab = ({
  onSubmitForm = () => {},
  statusForm = "review",
  data = {} as ICarrierById,
  handleFormState = () => {},
  tripTypes,
  onActiveProvider = () => {},
  onDesactivateProvider = () => {},
  onAuditProvider = () => {},
  isLoadingSubmit
}: CarrierFormTabProps) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const { data: documentsType, isLoading: isLoadingDocuments } = useSWR("documents/type/0", () =>
    getDocumentsByEntityType("0")
  );
  const [selectedFiles, setSelectedFiles] = useState<ICertificateAndDocuments[]>([]);
  const [isModalConfirmAuditOpen, setIsModalConfirmAuditOpen] = useState(false);
  const [imageFile, setImageFile] = useState<any | undefined>(undefined);
  const [loading, setloading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { locationTypes, isloadingTripTypes, groupLocations, availableCommunityCarrierTypes } =
    useCarrierFormTabTypes();

  const defaultValues = statusForm === "create" ? {} : dataToProjectFormData(data);
  const {
    watch,
    control,
    handleSubmit,
    reset,
    trigger,
    setValue,
    formState: { errors }
  } = useForm<IFormCarrier>({
    defaultValues,
    disabled: statusForm === "review"
  });
  const trip_type = watch("trip_type");
  const providerStatus = watch("status");
  const carrierType = watch("carrier_type");
  /*archivos*/
  interface FileObject {
    docReference: string;
    file: File | undefined;
  }
  const [files, setFiles] = useState<FileObject[] | any[]>([]);
  useEffect(() => {
    if (Array.isArray(documentsType)) {
      if (data?.documents?.length) {
        const fileSelected =
          documentsType
            ?.filter((f) => data.documents?.find((d) => d.id_document_type === f.id))
            .map((f) => {
              const doc = data.documents?.find((d) => d.id_document_type === f.id);
              return {
                ...f,
                file: undefined,
                link: doc?.url_archive,
                expirationDate: doc?.expiration_date
              };
            }) || [];
        setSelectedFiles(fileSelected);
      }
    }
  }, [files, documentsType]);

  useEffect(() => {
    console.log(files);
  }, [files]);

  useEffect(() => {
    if (!availableCommunityCarrierTypes.includes(Number(carrierType))) {
      setValue("group_location_select", []);
    }
  }, [carrierType]);

  const groupLocationDisable =
    !availableCommunityCarrierTypes.includes(Number(carrierType)) || statusForm === "review";

  const onSubmit = (data: IFormCarrier) => {
    if (statusForm === "edit") {
      _onSubmit(
        data,
        setloading,
        setImageError,
        imageFile ? [{ docReference: "imagen", file: imageFile }] : undefined,
        files,
        onSubmitForm,
        reset,
        false
      );
    }

    if (statusForm === "create") {
      console.info("crear con data", data);
    }
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
  return (
    <>
      <Form className="carrierForm">
        <Flex component={"header"} className="headerProyectsForm">
          <Link href="/logistics/providers/all">
            <Button
              type="text"
              size="large"
              className="buttonGoBack"
              icon={<CaretLeft size={"1.45rem"} />}
            >
              Ver Proveedores
            </Button>
          </Link>
          <Flex gap={"0.5rem"} align="center">
            {providerStatus && (
              <Flex>
                <CustomTag text={providerStatus.description} color={providerStatus.color} />
              </Flex>
            )}
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
              />
            </Dropdown>
          </Flex>
        </Flex>
        <Flex component={"main"} flex="1" vertical style={{ paddingRight: "1rem" }}>
          <Row gutter={16}>
            <Col span={5}>
              {" "}
              {/* Columna Logo */}
              <Title className="title" level={4}>
                Logo
              </Title>
              <UploadImg
                disabled={statusForm !== "create"}
                imgDefault={
                  watch("photo") ??
                  "https://cdn.icon-icons.com/icons2/1622/PNG/512/3741756-bussiness-ecommerce-marketplace-onlinestore-store-user_108907.png"
                }
                setImgFile={setImageFile}
                uploadInstructionsText="*Sube la foto del logo"
              />
              {imageError && (
                <Text className="textError">{"foto del conductor es obligatorio *"}</Text>
              )}
            </Col>
            <Col span={19}>
              {" "}
              {/* Columna Informacion General */}
              <Title className="title" level={4}>
                Informacion General
              </Title>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <InputForm
                    titleInput="Nit"
                    nameInput="nit"
                    control={control}
                    error={undefined}
                    disabled={statusForm !== "create"}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    titleInput="Nombre"
                    nameInput="description"
                    control={control}
                    error={undefined}
                    disabled={statusForm !== "create"}
                  />
                </Col>
                <Col span={8}>
                  <InputSelect
                    titleInput="Tipo de proveedor"
                    nameInput="carrier_type"
                    control={control}
                    error={undefined}
                    options={locationTypes?.map((locationType) => ({
                      label: locationType.description,
                      value: locationType.id
                    }))}
                    disabled={statusForm === "review"}
                    loading={isloadingTripTypes}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    titleInput="Razon social"
                    nameInput="description"
                    control={control}
                    error={undefined}
                    disabled={statusForm !== "create"}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    titleInput="Correo de facturacion"
                    nameInput="email"
                    control={control}
                    error={undefined}
                    disabled={statusForm !== "create"}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    titleInput="Correo de comunicacion"
                    nameInput="email_communication"
                    control={control}
                    error={undefined}
                    disabled={statusForm !== "create"}
                  />
                </Col>
              </Row>
              <Title className="title" level={4} style={{ marginTop: "1rem" }}>
                Datos de Contacto
              </Title>
              <Row gutter={[16, 16]}>
                {" "}
                {/* Fila Datos de contacto*/}
                <Col span={8}>
                  <InputForm
                    titleInput="Nombres y apellidos"
                    nameInput="description"
                    control={control}
                    error={errors?.description}
                    disabled={statusForm !== "create"}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    typeInput="tel"
                    titleInput="Teléfono"
                    nameInput="phone"
                    control={control}
                    error={errors?.phone}
                    validationRules={{
                      pattern: {
                        value: /^\+?\d+$/,
                        message: "Solo se permiten números y un signo '+' al comienzo"
                      }
                    }}
                    disabled={statusForm !== "create"}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          {/* ----------------------------------Tipos de viaje--------------------------------- */}
          <Row style={{ width: "100%", marginTop: "2rem" }}>
            <Title className="title" level={4}>
              Tipos de viaje
            </Title>
            <Controller
              name="trip_type"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <MultiSelectTags
                  field={field}
                  placeholder="Seleccione"
                  title="Tipos de viaje que esta autorizado"
                  errors={errors?.trip_type}
                  options={tripTypes?.map((tripType) => ({
                    label: tripType.description,
                    value: tripType.id
                  }))}
                  disabled={statusForm === "review"}
                />
              )}
            />
          </Row>
          <Row style={{ width: "100%", marginTop: "2rem" }}>
            <Title className="title" level={4}>
              Grupo de ubicaciones {groupLocationDisable.toString()}
            </Title>
            <Controller
              name="group_location_select"
              control={control}
              disabled={groupLocationDisable}
              rules={{ required: true }}
              render={({ field }) => (
                <MultiSelectTags
                  field={field}
                  defaultValue={data?.group_location_ids?.map((id) => ({
                    label: groupLocations?.find((gl) => gl.id === id)?.name || "",
                    value: id
                  }))}
                  placeholder="Seleccione"
                  title="Solo para transportadores tipo comunidad"
                  errors={errors?.group_location_select}
                  options={groupLocations?.map((groupLocation) => ({
                    label: groupLocation.name,
                    value: groupLocation.id
                  }))}
                />
              )}
            />
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
              {statusForm === "create" && (
                <LoadDocumentsButton text="Cargar documentos" onClick={() => {}} />
              )}
            </Col>
            {/* <DocumentsTable selectedFiles={selectedFiles} /> */}
          </Row>
          {["edit", "create"].includes(statusForm) && (
            <Row justify={"end"}>
              <SubmitFormButton
                loading={isLoadingSubmit}
                disabled={isLoadingSubmit}
                text={validationButtonText(statusForm)}
                onClick={async () => {
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
      <ModalConfirmAudit
        isOpen={isModalConfirmAuditOpen}
        onClose={() => setIsModalConfirmAuditOpen(false)}
        onConfirm={onAuditProvider}
        title="Auditar proveedor"
        description={[
          "¿Confirma que el proveedor cumple con los requerimientos legales y de HSEQ?",
          "Confirmo que está autorizado para manejar"
        ]}
        tags={trip_type}
      />
      <ModalChangeStatus
        isActiveStatus={true}
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        onActive={onActiveProvider}
        onDesactivate={onDesactivateProvider}
      />
    </>
  );
};
