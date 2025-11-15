import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { mutate } from "swr";
import dayjs from "dayjs";
import Link from "next/link";
import { CaretLeft, Sparkle } from "phosphor-react";

//utils
import { deleteDocumentById } from "@/services/logistics/providers/providers";
import {
  _onSubmit,
  dataToProjectFormData,
  validationButtonText,
  DriverFormTabProps
} from "./driverFormTab.mapper";
import { bloodTypesOptions, licencesOptions } from "../formSelectOptions";
import useScreenWidth from "@/components/hooks/useScreenWidth";

// components
import { Button, Col, Flex, Form, message, Row, Typography } from "antd";
import { ModalChangeStatus } from "@/components/molecules/modals/ModalChangeStatus/ModalChangeStatus";
import SubmitFormButton from "@/components/atoms/SubmitFormButton/SubmitFormButton";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import { DocumentsTable } from "@/components/molecules/tables/logistics/documentsTable/DocumentsTable";
import ModalUploadRequirements, {
  IUploadRequirementstTableRow
} from "@/components/organisms/logistics/proveedores/ModalUploadRequirements/ModalUploadRequirements";
import ModalConfirmAudit from "./components/ModalConfirmAudit";
import { DriverFormAndInputs } from "./components/DriverFormAndInputs";
import CustomTag from "@/components/atoms/CustomTag";
import ModalGenerateActionProviders from "@/components/organisms/logistics/proveedores/ModalGenerateActionProviders/ModalGenerateActionProviders";
import { ModalAddRequirement } from "@/components/organisms/logistics/proveedores/ModalAddRequirement/ModalAddRequirement";
import ModalAuditRequirements from "@/components/organisms/logistics/proveedores/ModalAuditRequirements/ModalAuditRequirements";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";
import { auditWithCashportAI } from "@/services/logistics/documents/documents";

//types
import { IFormDriver, IGeneralDriverSubmit, IProviderDocument } from "@/types/logistics/schema";

//styles
import "./driverformtab.scss";

const { Title } = Typography;

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
  onAuditDriver = async () => {},
  mutateData = () => {}
}: DriverFormTabProps) => {
  const [isModalOpen, setIsModalOpen] = useState({
    selected: 0
  });
  const [currentDocuments, setCurrentDocuments] = useState<IProviderDocument[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<IUploadRequirementstTableRow[]>([]);
  const [selectedDocumentRows, setSelectedDocumentRows] = useState<IProviderDocument[]>([]);

  const [imageFile, setImageFile] = useState<any | undefined>(undefined);
  const [resetTrigger, setResetTrigger] = useState<boolean>(false);
  const [imageError, setImageError] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);

  const width = useScreenWidth();
  const isMobile = width && width <= 768;

  const defaultValues =
    statusForm === "create" ? {} : data && dataToProjectFormData(data, vehiclesTypesList || []);
  const {
    watch,
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
  const trip_type = watch("general.trip_type");

  useEffect(() => {
    if (data) {
      setCurrentDocuments(data.documents);
    }
  }, [data]);

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

  const onSubmit = (data: IFormDriver) => {
    setResetTrigger(false);
    const documents = uploadedFiles.map((doc, index) => {
      const document: {
        documentTypeId: number;
        fieldName: string;
        expiryDate?: string;
      } = {
        documentTypeId: doc.requirementType!,
        fieldName: doc.fileName || `documento-${index + 1}`
      };

      if (doc.expirationDate) {
        document.expiryDate = doc.expirationDate;
      }

      return document;
    });

    const dataToSubmit: IFormDriver<IGeneralDriverSubmit> = {
      ...data,
      general: {
        ...data.general,
        license_categorie:
          licencesOptions.find(
            (item) =>
              item.id === data.general.license_category ||
              String(item.value) === String(data.general.license_category)
          )?.value ?? "",
        rhval:
          bloodTypesOptions.find(
            (item) =>
              String(item.id) === String(data.general.rh) ||
              String(item.value) === String(data.general.rh)
          )?.value ?? "",
        vehicle_type: data.general.vehicle_type.map((v: any) => v.value),
        documents: documents as unknown as IProviderDocument[]
      }
    };

    _onSubmit(
      dataToSubmit,
      uploadedFiles,
      imageFile ? [{ docReference: "imagen", file: imageFile }] : undefined,
      onSubmitForm
    );
  };

  useEffect(() => {
    if (imageFile) {
      setImageError(false); // Limpia el error si se carga una imagen
    }
  }, [imageFile]);

  const handleCloseModal = () =>
    setIsModalOpen({
      selected: 0
    });

  const handleAudit = async () => {
    setLoadingRequest(true);
    const subjectId = data?.subject_id ?? 0;

    try {
      await auditWithCashportAI(subjectId);
      message.success("Auditoría enviada con éxito a CashportAI.");
      mutateData();
    } catch (error) {
      message.error("Error al enviar auditoría.");
      console.error("Audit error:", error);
    }

    setLoadingRequest(false);
  };

  const handleOpenModal = (modalNumber: number) =>
    setIsModalOpen({
      selected: modalNumber
    });

  const handleDeleteDocument = async () => {
    setLoadingRequest(true);
    if (selectedDocumentRows?.length) {
      const ids = selectedDocumentRows.map((row) => row.id);
      try {
        await Promise.all(ids.map((id) => deleteDocumentById(data?.subject_id ?? 0, id)));
        message.success("Documentos eliminados correctamente");
        setIsModalOpen({ selected: 0 });
        setSelectedDocumentRows([]);
        mutate(params.driverId);
      } catch (error) {
        message.error("Error al eliminar documentos");
      }
    }
    setLoadingRequest(false);
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
              {isMobile ? "" : "Ver Conductores"}
            </Button>
          </Link>
          {statusForm !== "create" && (
            <Flex gap={"0.5rem"} align="center">
              <Flex>
                <CustomTag
                  text={data?.status.name || "Sin estado"}
                  color={data?.status.color || "defaultColor"}
                />
              </Flex>

              <GenerateActionButton
                onClick={() => {
                  setIsModalOpen({ selected: 1 });
                }}
                label={isMobile ? "" : undefined}
              />
            </Flex>
          )}
        </Flex>
        <Flex component={"main"} flex="1" vertical>
          <DriverFormAndInputs
            control={control}
            errors={errors}
            watch={watch}
            statusForm={statusForm}
            vehiclesTypesList={vehiclesTypesList || []}
            tripTypes={tripTypes}
            imageFile={imageFile}
            setImageFile={setImageFile}
            resetTrigger={resetTrigger}
            imageError={imageError}
          />
          <Row style={{ marginTop: "2rem", marginBottom: "2rem" }}>
            {" "}
            {/* Fila Documentos */}
            <Col span={24}>
              <div className="documentsTitle">
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

                {statusForm !== "create" && (
                  <Row style={{ marginTop: 16, marginBottom: 8 }}>
                    <Col span={24}>
                      <Flex justify="end">
                        <Button className="iaButton" onClick={handleAudit} loading={loadingRequest}>
                          <Sparkle size={14} color="#5b21b6" weight="fill" />
                          <span className="textNormal">
                            Auditar con{" "}
                            <span className="cashportIATextGradient" style={{ fontWeight: 500 }}>
                              CashportAI
                            </span>
                          </span>
                        </Button>
                      </Flex>
                    </Col>
                  </Row>
                )}
              </div>
            </Col>
            <Col span={24} style={{ marginTop: "1.5rem" }}>
              {(statusForm === "review" || statusForm === "edit") && (
                <DocumentsTable
                  currentFiles={currentDocuments}
                  subjectId={data?.subject_id}
                  selectedDocumentRows={selectedDocumentRows}
                  setSelectedDocumentRows={setSelectedDocumentRows}
                  mutateId={params.driverId}
                />
              )}
              {statusForm === "create" && (
                <DocumentsTable
                  currentFiles={uploadedFiles.map(
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
                loading={isLoadingSubmit}
                disabled={isLoadingSubmit}
                text={validationButtonText(statusForm)}
                onClick={async () => {
                  const hasPhoto = !!imageFile;
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

      <ModalGenerateActionProviders
        isOpen={isModalOpen.selected === 1}
        onClose={handleCloseModal}
        handleOpenModal={handleOpenModal}
        statusForm={statusForm}
        handleFormState={handleFormState}
        resetForm={reset}
        selectedDocumentRows={selectedDocumentRows}
      />

      <ModalChangeStatus
        // TO DO: active status from data, not arriving from backend
        isActiveStatus={true}
        isOpen={isModalOpen.selected === 2}
        onClose={handleCloseModal}
        onActive={async () => {
          await onActiveProject();
          setIsModalOpen({ selected: 0 });
          handleFormState("review");
        }}
        onDesactivate={async () => {
          await onDesactivateProject();
          setIsModalOpen({ selected: 0 });
          handleFormState("review");
        }}
      />
      <ModalConfirmAudit
        isOpen={isModalOpen.selected === 3}
        onClose={() => setIsModalOpen({ selected: 0 })}
        onConfirm={onAuditDriver}
        title="Auditar conductor"
        description={[
          "¿Confirma que el vehículo cumple con los requerimientos legales y de HSEQ?",
          "Confirmo que está autorizado para manejar"
        ]}
        tags={trip_type}
      />

      <ModalAddRequirement
        isOpen={isModalOpen.selected === 4}
        onClose={(cancelClicked) => {
          if (cancelClicked) {
            return setIsModalOpen({ selected: 1 });
          }
          handleCloseModal();
          mutate(params.driverId);
        }}
        subjectId={data?.subject_id || 0}
      />

      <ModalAuditRequirements
        isOpen={isModalOpen.selected === 5}
        onClose={(cancelClicked) => {
          if (cancelClicked) {
            return setIsModalOpen({ selected: 1 });
          }
          handleCloseModal();
          mutate(params.driverId);

          setSelectedDocumentRows([]);
        }}
        selectedRows={selectedDocumentRows}
      />

      <ModalConfirmAction
        isOpen={isModalOpen.selected === 6}
        onClose={() => {
          setIsModalOpen({ selected: 0 });
        }}
        onOk={handleDeleteDocument}
        title={`¿Está seguro de eliminar ${selectedDocumentRows?.length ?? 0} documento${(selectedDocumentRows?.length ?? 0) > 1 ? "s" : ""}?`}
        okText="Eliminar"
        okLoading={loadingRequest}
      />

      <ModalUploadRequirements
        isOpen={isModalOpen.selected === -1}
        onClose={handleCloseModal}
        documentsTypesList={documentsTypesList}
        onUpload={(data) => {
          setUploadedFiles((prev) => [...prev, ...data.rows]);
        }}
      />
    </>
  );
};
