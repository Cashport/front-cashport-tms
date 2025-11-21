import { useEffect, useState } from "react";
import { Button, Col, Flex, Form, message, Row, Typography } from "antd";
import { useForm } from "react-hook-form";
import { CaretLeft, Sparkle } from "phosphor-react";
import utc from "dayjs/plugin/utc";
import { mutate } from "swr";

// components
import { ModalChangeStatus } from "@/components/molecules/modals/ModalChangeStatus/ModalChangeStatus";
import { VehicleFormAndInputs } from "./components/VehicleFormAndInputs/VehicleFormAndInputs";

import {
  _onSubmitVehicle,
  normalizeVehicleData,
  validationButtonText,
  VehicleFormTabProps
} from "./vehicleFormTab.mapper";
import "./vehicleformtab.scss";
import { IFormGeneralVehicle, IFormVehicle, IProviderDocument } from "@/types/logistics/schema";

import Link from "next/link";
import dayjs from "dayjs";
import SubmitFormButton from "@/components/atoms/SubmitFormButton/SubmitFormButton";
import ModalConfirmAudit from "../driverForm/components/ModalConfirmAudit";
import CustomTag from "@/components/atoms/CustomTag";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import React from "react";
import { DocumentsTable } from "@/components/molecules/tables/logistics/documentsTable/DocumentsTable";
import ModalUploadRequirements, {
  IUploadRequirementstTableRow
} from "@/components/organisms/logistics/proveedores/ModalUploadRequirements/ModalUploadRequirements";
import ModalGenerateActionProviders from "@/components/organisms/logistics/proveedores/ModalGenerateActionProviders/ModalGenerateActionProviders";
import { ModalAddRequirement } from "@/components/organisms/logistics/proveedores/ModalAddRequirement/ModalAddRequirement";
import ModalAuditRequirements from "@/components/organisms/logistics/proveedores/ModalAuditRequirements/ModalAuditRequirements";
import { deleteDocumentById } from "@/services/logistics/providers/providers";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";
import { auditWithCashportAI } from "@/services/logistics/documents/documents";
import useScreenWidth from "@/components/hooks/useScreenWidth";

const { Title } = Typography;

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
  onAuditVehicle = () => {},
  mutateData = () => {}
}: VehicleFormTabProps) => {
  const [isModalOpen, setIsModalOpen] = useState({
    selected: 0
  });
  const [imageError, setImageError] = useState(false);
  const [hasGPS, setHasGPS] = useState(data?.has_gps || false);
  const [currentDocuments, setCurrentDocuments] = useState<IProviderDocument[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<IUploadRequirementstTableRow[]>([]);
  const [selectedDocumentRows, setSelectedDocumentRows] = useState<IProviderDocument[]>([]);
  const [loadingRequest, setLoadingRequest] = useState(false);

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

  const width = useScreenWidth();
  const isMobile = width && width <= 768;

  useEffect(() => {
    if (data) {
      setCurrentDocuments(data.documents);
    }
  }, [data]);

  const formImages = watch("general.images");

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
    const formImages =
      data.images?.map((file) => ({
        file,
        docReference: file.name
      })) || [];

    _onSubmitVehicle(vehicleData, uploadedFiles, formImages, setImageError, onSubmitForm);
    setImages(Array(5).fill({ file: undefined }));
  };

  const handleAudit = async () => {
    setLoadingRequest(true);
    const subjectId = data?.subject_id ?? 0;

    try {
      await auditWithCashportAI(subjectId);
      message.success("Auditoría enviada con éxito a CashportAI.");
      // TO DO: Mutate to refresh the data after audit
      mutateData();
    } catch (error) {
      message.error("Error al enviar auditoría.");
      console.error("Audit error:", error);
    }

    setLoadingRequest(false);
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

  const handleCloseModal = () =>
    setIsModalOpen({
      selected: 0
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
        mutate(params.vehicleId);
      } catch (error) {
        message.error("Error al eliminar documentos");
      }
    }
    setLoadingRequest(false);
  };

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
              {isMobile ? "" : "Ver vehículos"}
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
                label={isMobile ? "" : undefined}
              />
            </Flex>
          )}
        </Flex>
        <Flex component={"main"} flex="3" vertical>
          <VehicleFormAndInputs
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
            statusForm={statusForm}
            vehiclesTypesList={vehiclesTypesList || []}
            features={features}
            images={images}
            setImages={setImages}
            imageError={imageError}
            setImageError={setImageError}
            hasGPS={hasGPS}
            setHasGPS={setHasGPS}
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
                  mutateId={params.vehicleId}
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
                loading={isLoading}
                disabled={isLoading}
                text={validationButtonText(statusForm)}
                onClick={async () => {
                  console.log("isvalid", isValid);
                  console.log("error", errors);

                  if (!hasImages()) {
                    setImageError(true);
                    return;
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
        onClose={handleCloseModal}
        handleOpenModal={handleOpenModal}
        statusForm={statusForm}
        handleFormState={handleFormState}
        resetForm={reset}
        selectedDocumentRows={selectedDocumentRows}
      />

      <ModalChangeStatus
        isActiveStatus={true}
        isOpen={isModalOpen.selected === 2}
        onClose={handleCloseModal}
        onActive={onActiveVehicle}
        onDesactivate={onDesactivateVehicle}
      />

      <ModalConfirmAudit
        isOpen={isModalOpen.selected === 3}
        onClose={handleCloseModal}
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

      <ModalAddRequirement
        isOpen={isModalOpen.selected === 4}
        onClose={(cancelClicked) => {
          if (cancelClicked) {
            return setIsModalOpen({ selected: 1 });
          }
          handleCloseModal();
          mutate(params.vehicleId);
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
          mutate(params.vehicleId);

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
