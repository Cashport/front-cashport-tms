import { useEffect, useState } from "react";
import { Button, Col, Flex, Form, Row, Select, Typography } from "antd";
import { useForm } from "react-hook-form";
import { CaretLeft } from "phosphor-react";

import { ModalChangeStatus } from "@/components/molecules/modals/ModalChangeStatus/ModalChangeStatus";
import { UploadImg } from "@/components/atoms/UploadImg/UploadImg";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import "./carrierformtab.scss";
import {
  _onSubmit,
  dataToProjectFormData,
  validationButtonText,
  CarrierFormTabProps
} from "./carrierFormTab.mapper";
import { IFormCarrier } from "@/types/logistics/schema";
import { bloodTypes } from "@/components/molecules/logistics/SelectRh/SelectRh";
import { UploadDocumentButton } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import { licences } from "@/components/molecules/logistics/SelectLicenceCategory/SelectLicenceCategory";
import useSWR from "swr";
import { getDocumentsByEntityType } from "@/services/logistics/certificates";
import { DocumentCompleteType } from "@/types/logistics/certificate/certificate";
import UploadDocumentChild from "@/components/atoms/UploadDocumentChild/UploadDocumentChild";
import dayjs from "dayjs";
import SubmitFormButton from "@/components/atoms/SubmitFormButton/SubmitFormButton";
import LoadDocumentsButton from "@/components/atoms/LoadDocumentsButton/LoadDocumentsButton";

const { Title, Text } = Typography;
const { Option } = Select;

export const CarrierFormTab = ({
  onEditProject = () => {},
  onSubmitForm = () => {},
  statusForm = "review",
  data = [],
  onActiveProject = () => {},
  onDesactivateProject = () => {}
}: CarrierFormTabProps) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const { data: documentsType, isLoading: isLoadingDocuments } = useSWR(
    "0",
    getDocumentsByEntityType
  );
  const [selectedFiles, setSelectedFiles] = useState<DocumentCompleteType[]>([]);

  const [imageFile, setImageFile] = useState<any | undefined>(undefined);
  const [loading, setloading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const defaultValues = statusForm === "create" ? {} : dataToProjectFormData(data[0]);
  const {
    watch,
    setValue,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<IFormCarrier>({
    defaultValues,
    disabled: statusForm === "review"
  });
  /*archivos*/
  interface FileObject {
    docReference: string;
    file: File | undefined;
  }
  const [files, setFiles] = useState<FileObject[] | any[]>([]);
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
        setSelectedFiles(fileSelected);
      }
    }
  }, [files, documentsType]);

  useEffect(() => {
    console.log(files);
  }, [files]);

  const onSubmit = (data: any) => {
    data.general.license_categorie = licences.data.find(
      (item) => item.id === data.general.license_category
    )?.value;
    data.general.rh = bloodTypes.data.find((item) => item.id === data.general.rh)?.value;
    _onSubmit(
      data,
      setloading,
      setImageError,
      imageFile ? [{ docReference: "imagen", file: imageFile }] : undefined,
      files,
      onSubmitForm,
      reset
    );
  };
  return (
    <>
      <Form className="carrierForm">
        <Flex component={"header"} className="headerProyectsForm">
          <Button
            type="text"
            size="large"
            href="/logistics/providers/all"
            className="buttonGoBack"
            icon={<CaretLeft size={"1.45rem"} />}
          >
            Ver Proveedores
          </Button>
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
                disabled={statusForm === "review"}
                imgDefault={
                  watch("general.photo") ??
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
                    nameInput="general.nit"
                    control={control}
                    error={undefined}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    titleInput="Nombre"
                    nameInput="general.description"
                    control={control}
                    error={undefined}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    titleInput="Tipo de proveedor"
                    nameInput="general.carrier_type"
                    control={control}
                    error={undefined}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    titleInput="Razon social"
                    nameInput="general.description"
                    control={control}
                    error={undefined}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    titleInput="Correo de facturacion"
                    nameInput="general.description"
                    control={control}
                    error={undefined}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    titleInput="Correo de comunicacion"
                    nameInput="general.carrier_type"
                    control={control}
                    error={undefined}
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
                    nameInput="general.description"
                    control={control}
                    error={errors?.general?.description}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    typeInput="tel"
                    titleInput="Teléfono"
                    nameInput="general.description"
                    control={control}
                    error={errors?.general?.description}
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
                disabled={!isDirty}
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
    </>
  );
};
