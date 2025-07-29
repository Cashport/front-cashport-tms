import { Flex, Modal, Skeleton } from "antd";
import { CaretLeft } from "phosphor-react";
import { useEffect, useMemo, useState } from "react";
import styles from "./ModalBillingMT.module.scss";
import { MessageInstance } from "antd/es/message/interface";
import { EvidenceByVehicleForm, IParsedFormValues } from "./controllers/formbillingmt.types";
import { useForm, useWatch } from "react-hook-form";
import FooterButtons from "../ModalBillingAction/FooterButtons/FooterButtons";
import { DocumentFields } from "./components/DocumentsFields";
import {
  getOtherRequirementDetails,
  getTripDetails,
  IGetTripDetails,
  addTripDocuments,
  addOtherRequirementDocuments
} from "@/services/trips/trips";
import { IRequestAPI } from "../ModalGenerateActionTO/FinalizeTrip/FinalizeTrip";

type PropsModalBillingMT = {
  idTR: string;
  idTrip: number;
  idReq: number;
  isOpen: boolean;
  onClose: () => void;
  messageApi: MessageInstance;
  mode: "view" | "edit";
};

export default function ModalBillingMT(props: Readonly<PropsModalBillingMT>) {
  const { isOpen, onClose, idTrip, idReq, messageApi, mode } = props;
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deletedDocs, setDeletedDocs] = useState<string[]>([]);

  const { control, handleSubmit, setValue, reset, trigger, register, formState } =
    useForm<EvidenceByVehicleForm>();
  const formValues = useWatch({ control });

  function createDefaultValuesVehicle(vehicle: IGetTripDetails): EvidenceByVehicleForm {
    return {
      description: vehicle.plate_number,
      entityId: vehicle.id,
      entityType: "trip",
      documents:
        vehicle.MT?.length > 0
          ? vehicle.MT.map((MT, index) => {
              return {
                link: MT.url ?? undefined,
                file: undefined,
                docReference: index.toString(),
                name: MT.name ?? ""
              };
            })
          : [
              {
                link: undefined,
                file: undefined,
                docReference: "",
                name: ""
              }
            ]
    };
  }
  function createDefaultValuesReq(req: IRequestAPI): EvidenceByVehicleForm {
    return {
      description: req.description,
      entityId: req.id,
      entityType: "requirement",
      documents:
        req.MT?.length > 0
          ? req.MT.map((MT, index) => {
              return {
                link: MT.url ?? undefined,
                file: undefined,
                docReference: index.toString(),
                name: MT.name ?? ""
              };
            })
          : [
              {
                link: undefined,
                file: undefined,
                docReference: "",
                name: ""
              }
            ]
    };
  }

  async function getFormInfo() {
    try {
      setIsLoading(true);
      if (props.idTrip) {
        const response = await getTripDetails(idTrip);
        if (response) {
          const defaultValues = createDefaultValuesVehicle(response);
          reset(defaultValues);
        }
      }
      if (props.idReq) {
        const response = await getOtherRequirementDetails(idReq);
        if (response) {
          const defaultValues = createDefaultValuesReq(response);
          reset(defaultValues);
        }
      }
    } catch (error) {
      messageApi?.open({
        type: "error",
        content: "Hubo un problema, vuelve a intentarlo"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function sendForm(form: IParsedFormValues[]) {
    try {
      setIsLoading(true);
      if (idTrip) {
        const response = await addTripDocuments(form, idTrip);
        messageApi?.open({
          type: "success",
          content: (
            <>
              <p>Cambios guardados correctamente</p>
              <p>{response?.message}</p>
            </>
          ),
          duration: 3
        });
      }
      if (idReq) {
        const response = await addOtherRequirementDocuments(form, idReq);
        messageApi?.open({
          type: "success",
          content: (
            <>
              <p>Cambios guardados correctamente</p>
              <p>{response?.message}</p>
            </>
          ),
          duration: 3
        });
      }
    } catch (error: any) {
      messageApi?.open({
        type: "error",
        content: error?.message ?? "Hubo un error",
        duration: 3
      });
    } finally {
      setIsLoading(false);
      onClose();
    }
  }

  const onSubmit = (data: EvidenceByVehicleForm) => {
    const finalDocuments = [];

    // Documentos eliminados
    for (const link of deletedDocs) {
      finalDocuments.push({
        flag: "delete",
        url: link,
        file: undefined
      });
    }

    // 2. Documentos actuales (nuevos o actualizados)
    data.documents.forEach((doc) => {
      const originalDoc = formValues?.documents?.find((d) => d.docReference === doc.docReference);

      if (doc.file) {
        // Si no existía antes o cambió el archivo
        const isNew = !originalDoc?.link;
        finalDocuments.push({
          flag: isNew ? "new" : "update",
          url: doc.link,
          file: doc.file
        });
      }
    });

    sendForm(finalDocuments);
  };

  const handleOnChangeDocument = (fileToSave: any, documentIndex: number) => {
    const { file: rawFile } = fileToSave;
    if (rawFile) {
      const fileSizeInMB = rawFile.size / (1024 * 1024);
      if (fileSizeInMB > 30) {
        console.log(
          "El archivo es demasiado grande. Por favor, sube un archivo de menos de 30 MB."
        );
        return;
      }
      setValue(`documents.${documentIndex}.file`, rawFile);
      trigger(`documents.${documentIndex}`);
    }
  };

  useEffect(() => {
    if (!isInitialized && isOpen) {
      getFormInfo();
      setIsInitialized(true);
    }
    if (!isOpen) {
      setIsInitialized(false);
      setDeletedDocs([]);
    }
  }, [isInitialized, isOpen]);

  useEffect(() => {
    const allDocsAreEmpty = !formValues.documents || formValues.documents.length === 0;

    if (allDocsAreEmpty) {
      setValue("documents", [
        {
          link: undefined,
          file: undefined,
          docReference: ""
        }
      ]);
    }
  }, [formValues, setValue]);

  const renderTitle = () => {
    return (
      <Flex gap={8} align="center">
        <CaretLeft size={20} onClick={onClose} />
        <p className={styles.actionTitle}>Documentos de legalización</p>
      </Flex>
    );
  };

  const renderView = () => {
    if (isLoading) {
      return <Skeleton active loading={isLoading} />;
    }
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex vertical gap={24}>
          <Flex gap={4} vertical>
            <Flex justify="space-between">
              <p className={styles.subtitle}>Ingresa la información para finalizar el viaje</p>
            </Flex>
          </Flex>
          <Flex vertical key={`vehicle-1`}>
            <p className={styles.vehicleName}>
              {formValues?.entityType == "requirement" ? "" : "Vehículo"} {formValues.description}
            </p>
            <DocumentFields
              mode={mode}
              control={control}
              register={register}
              handleOnChangeDocument={handleOnChangeDocument}
              currentDocuments={formValues.documents ?? []}
              handleOnDeleteDocument={(index: number) => {
                const deletedDocUrl = (formValues.documents ?? [])[index]?.link;
                if (deletedDocUrl) {
                  setDeletedDocs((prev) => [...prev, deletedDocUrl]);
                }
              }}
            />
          </Flex>
        </Flex>
      </form>
    );
  };

  const isValid = useMemo(() => {
    return (
      formState.isDirty &&
      formValues.documents?.length !== formValues.documents?.filter((d) => d.file || d.link).length
    );
  }, [formState.isDirty, formValues.documents]);

  return (
    <Modal
      width={698}
      title={renderTitle()}
      styles={{ body: { maxHeight: "32rem", overflowY: "auto", paddingTop: 24 } }}
      centered
      open={isOpen}
      closeIcon={false}
      footer={
        !isLoading && (
          <FooterButtons
            isConfirmDisabled={isValid}
            titleConfirm={mode === "edit" ? "Guardar cambios" : "Cerrar"}
            onClose={onClose}
            handleOk={mode === "edit" ? handleSubmit(onSubmit) : onClose}
          />
        )
      }
    >
      {renderView()}
    </Modal>
  );
}

const areFilesEqual = (
  currentDocs: EvidenceByVehicleForm["documents"],
  initialDocs: EvidenceByVehicleForm["documents"]
): boolean => {
  // Si hay menos documentos, asumimos cambio (eliminación)
  if (currentDocs.length < initialDocs.length) return false;

  return currentDocs.every((doc) => {
    const currentFile = doc.file;

    // Si no tiene archivo, lo ignoramos (no cuenta como cambio)
    if (!currentFile) return true;

    // Buscamos el original por docReference
    const initialMatch = initialDocs.find((init) => init.docReference === doc.docReference);
    const initialFile = initialMatch?.file;

    if (!initialFile) return false;

    return initialFile.name === currentFile.name && initialFile.size === currentFile.size;
  });
};
