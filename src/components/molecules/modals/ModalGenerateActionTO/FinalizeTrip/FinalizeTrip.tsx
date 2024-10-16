import UiTabs from "@/components/ui/ui-tabs";
import { Flex, Skeleton } from "antd";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import styles from "./FinalizeTrip.module.scss";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { MessageInstance } from "antd/es/message/interface";
import FooterButtons from "../../ModalBillingAction/FooterButtons/FooterButtons";
import { emptyForm, FinalizeTripForm } from "./controllers/finalizetrip.types";
import TextArea from "antd/es/input/TextArea";
import { VehicleFields } from "./components/VehicleFields";
import { getCarriersTripsDetails, sendFinalizeTripAllCarriers } from "@/services/trips/trips";
import { STATUS } from "@/utils/constants/globalConstants";
import { NavEnum } from "@/components/organisms/logistics/transfer-orders/details/Details";

interface FinalizeTrip {
  idTR: string;
  onClose: () => void;
  messageApi: MessageInstance;
  statusTrId?: string;
  setNav: Dispatch<SetStateAction<NavEnum>>;
}

export interface IVehicleAPI {
  id: number;
  plate_number: string;
  MT: string[];
}
export interface ICarrierAPI {
  carrier_id: number;
  provider: string;
  vehicles: IVehicleAPI[];
  Observation: string;
}

const FinalizeTrip = ({ idTR, onClose, messageApi, statusTrId = "", setNav }: FinalizeTrip) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [carriersInfo, setCarriersInfo] = useState<ICarrierAPI[]>([]);
  const [defaultValues, setDefaultValues] = useState<FinalizeTripForm>(emptyForm);
  const hasAlreadyFinalized = statusTrId === STATUS.BNG.LEGALIZADO;
  const [isEditable, setIsEditable] = useState(!hasAlreadyFinalized);

  const { control, handleSubmit, setValue, reset, watch, trigger, register } =
    useForm<FinalizeTripForm>({
      defaultValues
    });
  const { fields: carriersFields } = useFieldArray({
    control,
    name: "carriers"
  });
  const tabsNames = carriersFields.map((c) => `${c.carrier}`);
  const formValues = useWatch({ control });

  // //Create default with api data
  function createDefaultValues(carriersAPI: ICarrierAPI[]): FinalizeTripForm {
    const defaultValues: any = carriersAPI.map((c, carrierIndex) => ({
      carrier: c.provider,
      idCarrier: c.carrier_id,
      vehicles: c.vehicles.map((v) => ({
        plate: v.plate_number,
        tripId: v.id,
        documents:
          v.MT?.length > 0
            ? v.MT.map((MTlink) => {
                return {
                  link: MTlink ?? undefined,
                  file: undefined,
                  docReference: carrierIndex
                };
              })
            : [
                {
                  link: undefined,
                  file: undefined,
                  docReference: carrierIndex
                }
              ]
      })),
      adittionalComment: c.Observation !== "" ? c.Observation : undefined
    }));
    return {
      carriers: defaultValues
    };
  }

  //Fetch pre-authorized info
  async function getFormInfo() {
    try {
      setIsLoading(true);
      const response = await getCarriersTripsDetails(Number(idTR));
      if (response) {
        setCarriersInfo(response);
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
  // Handle form submission
  async function sendForm(form: FinalizeTripForm) {
    try {
      setIsLoading(true);
      const response = await sendFinalizeTripAllCarriers(form, Number(idTR));
      if (response) {
        messageApi
          ?.open({
            type: "success",
            content: "Viaje finalizado correctamente",
            duration: 2
          })
          .then(() => setNav(NavEnum.BILLING));
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

  const onSubmit = (data: FinalizeTripForm) => {
    sendForm(data);
  };

  //Handle document changes
  const handleOnChangeDocument = (fileToSave: any, vehicleIndex: number, documentIndex: number) => {
    const { file: rawFile } = fileToSave;
    if (rawFile) {
      const fileSizeInMB = rawFile.size / (1024 * 1024);
      if (fileSizeInMB > 30) {
        console.log(
          "El archivo es demasiado grande. Por favor, sube un archivo de menos de 30 MB."
        );
        return;
      }
      setValue(
        `carriers.${selectedTab}.vehicles.${vehicleIndex}.documents.${documentIndex}.file`,
        rawFile
      );
      trigger(`carriers.${selectedTab}.vehicles.${vehicleIndex}.documents.${documentIndex}`);
    }
  };

  const handleOnDeleteDocument = (vehicleIndex: number, documentIndex: number) => {
    setValue(
      `carriers.${selectedTab}.vehicles.${vehicleIndex}.documents.${documentIndex}.file`,
      undefined
    );
    trigger(`carriers.${selectedTab}.vehicles.${vehicleIndex}.documents.${documentIndex}`);
  };

  useEffect(() => {
    if (!isInitialized) {
      getFormInfo();
      setIsInitialized(true);
    }
  }, [isInitialized]);
  useEffect(() => {
    if (carriersInfo) {
      const newDefaultValues = createDefaultValues(carriersInfo);
      setDefaultValues(newDefaultValues);
      reset(newDefaultValues);
    }
  }, [carriersInfo, reset]);

  const currentCarrier = watch(`carriers.${selectedTab}`);

  function validateVehiclesWithDocuments(form: any): boolean {
    for (const carrier of form.carriers) {
      for (const vehicle of carrier.vehicles) {
        const hasValidDocument = vehicle.documents.some(
          (document: any) => document.file || document.link
        );
        if (!hasValidDocument) {
          return false;
        }
      }
    }
    return true;
  }

  const allVehiclesHaveDocs = validateVehiclesWithDocuments(formValues);

  const isConfirmDisabled = !allVehiclesHaveDocs || !isEditable;

  if (isLoading) {
    return <Skeleton active loading={isLoading} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex vertical gap={24} style={{ paddingBottom: 24 }}>
        <Flex gap={4} vertical>
          <Flex justify="space-between">
            <p className={styles.subtitle}>
              Confirme los documentos de legalización para finalizar el viaje
            </p>
          </Flex>
        </Flex>
        <UiTabs
          tabs={tabsNames}
          onTabClick={(index) => setSelectedTab(index)}
          initialTabIndex={selectedTab}
          className={styles.scrollableTabsUI}
        />
        <Flex vertical>
          <div key={currentCarrier?.idCarrier}>
            <VehicleFields
              control={control}
              register={register}
              selectedTab={selectedTab}
              handleOnChangeDocument={handleOnChangeDocument}
              handleOnDeleteDocument={handleOnDeleteDocument}
              currentCarrier={currentCarrier}
              disabled={!isEditable}
            />
          </div>
        </Flex>
        <Flex vertical gap={8}>
          <p className={styles.comments}>Comentarios adicionales</p>
          <div>
            <TextArea
              placeholder="Escribe los comentarios adicionales"
              value={currentCarrier?.adittionalComment}
              style={{ minHeight: "40px" }}
              disabled={!isEditable}
              autoSize={{ minRows: 1, maxRows: 4 }}
              onChange={(event) => {
                setValue(`carriers.${selectedTab}.adittionalComment`, event.target.value);
              }}
            />
          </div>
        </Flex>
      </Flex>
      <FooterButtons
        isConfirmDisabled={isConfirmDisabled}
        titleConfirm="Finalizar viaje"
        onClose={onClose}
        handleOk={handleSubmit(onSubmit)}
      />
    </form>
  );
};
export default FinalizeTrip;
