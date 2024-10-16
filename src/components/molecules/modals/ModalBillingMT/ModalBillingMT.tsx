import { Flex, Modal, Skeleton } from "antd";
import { CaretLeft } from "phosphor-react";
import { useEffect, useState } from "react";
import styles from "./ModalBillingMT.module.scss";
import { MessageInstance } from "antd/es/message/interface";
import {
  emptyForm,
  emptyVehicle,
  EvidenceByVehicleForm,
  IVehicleAPI
} from "./controllers/formbillingmt.types";
import { useForm, useWatch } from "react-hook-form";
import FooterButtons from "../ModalBillingAction/FooterButtons/FooterButtons";
import { DocumentFields } from "./components/DocumentsFields";
import { getTripDetails, sendFinalizeTrip } from "@/services/trips/trips";

type PropsModalBillingMT = {
  idTR: string;
  idTrip: number;
  isOpen: boolean;
  onClose: () => void;
  messageApi: MessageInstance;
  mode: "view" | "edit";
};

export default function ModalBillingMT(props: Readonly<PropsModalBillingMT>) {
  const { isOpen, onClose, idTrip, messageApi, mode } = props;
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState<IVehicleAPI>(emptyVehicle);
  const [defaultValues, setDefaultValues] = useState<EvidenceByVehicleForm>(emptyForm);

  const { control, handleSubmit, setValue, reset, trigger, register } =
    useForm<EvidenceByVehicleForm>({
      defaultValues
    });
  const formValues = useWatch({ control });

  function createDefaultValues(vehicle: IVehicleAPI): EvidenceByVehicleForm {
    return {
      plate: vehicle.plate_number,
      idTrip: vehicle.id,
      documents:
        vehicle.MT?.length > 0
          ? vehicle.MT.map((MTlink, index) => {
              return {
                link: MTlink ?? undefined,
                file: undefined,
                docReference: index.toString()
              };
            })
          : [
              {
                link: undefined,
                file: undefined,
                docReference: ""
              }
            ]
    };
  }

  async function getFormInfo() {
    try {
      setIsLoading(true);
      const response = await getTripDetails(idTrip);
      if (response) {
        setVehicleInfo(response);
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

  async function sendForm(form: EvidenceByVehicleForm) {
    try {
      setIsLoading(true);
      const response = await sendFinalizeTrip(form, idTrip);
      if (response) {
        messageApi?.open({
          type: "success",
          content: "Viaje finalizado correctamente",
          duration: 3
        });
      } else {
        messageApi?.open({
          type: "error",
          content: "Hubo un error finalizando el viaje",
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
    sendForm(data);
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

  const handleOnDeleteDocument = (documentIndex: number) => {
    setValue(`documents.${documentIndex}.file`, undefined);
    trigger(`documents.${documentIndex}`);
  };

  useEffect(() => {
    if (!isInitialized && isOpen) {
      getFormInfo();
      setIsInitialized(true);
    }
    if (!isOpen) {
      setIsInitialized(false);
    }
  }, [isInitialized, isOpen]);

  useEffect(() => {
    if (vehicleInfo) {
      const newDefaultValues = createDefaultValues(vehicleInfo);
      setDefaultValues(newDefaultValues);
      reset(newDefaultValues);
    }
  }, [vehicleInfo, reset]);

  const hasAtLeastOneDoc = formValues.documents?.some((document) => document.file || document.link);
  const isConfirmDisabled = !hasAtLeastOneDoc;

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
            <p className={styles.vehicleName}>Vehículo {formValues.plate}</p>
            <DocumentFields
              mode={mode}
              control={control}
              register={register}
              handleOnChangeDocument={handleOnChangeDocument}
              handleOnDeleteDocument={handleOnDeleteDocument}
              currentDocuments={formValues.documents ?? []}
            />
          </Flex>
        </Flex>
      </form>
    );
  };

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
            isConfirmDisabled={isConfirmDisabled}
            titleConfirm={mode === "edit" ? "Finalizar viaje" : "Cerrar"}
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
