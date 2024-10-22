import { Modal, Flex } from "antd";
import { X } from "phosphor-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import styles from "./ModalCreateJourney.module.scss";
import { useForm } from "react-hook-form";
import { FormMode, Journey, JourneyFormValues } from "./utils/types";
import { yupResolver } from "@hookform/resolvers/yup";
import { journeySchema } from "./utils/validationSchema";
import TypeOfTrip from "./TypeOfTrip/TypeOfTrip";
import { defaultJourneyValues } from "./utils/defaultTripFormValues";
import Booking from "./Booking/Booking";
import { createJourney, deleteJourney, updateJourney } from "./services/createJourney";
import { MODE_PRICING } from "@/components/organisms/logistics/orders/transfer_request/constant/constants";
import { ITrackingResponse, ITransferOrdersRequest } from "@/types/logistics/schema";
import { FooterButtons } from "./components/FooterButtons/FooterButtons";
import {
  combineDateTimeDayjs,
  createDataSoftSave,
  createFormValues,
  getServiceDescription
} from "./utils/createData";
import { MessageInstance } from "antd/es/message/interface";
import {
  generateDeleteConfirmationMessage,
  generateEditConfirmationMessage
} from "./utils/createEditionMessage";

// dayjs locale
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";

dayjs.locale("es");
dayjs.extend(utc);
dayjs.extend(tz);

type ModalCreateJourneyProps = {
  visible: boolean;
  onClose: () => void;
  selectedTrip?: Journey;
  nextJourneyOrder: number;
  idTransferRequest: number;
  mode: MODE_PRICING;
  setOrders: React.Dispatch<React.SetStateAction<ITransferOrdersRequest | undefined>>;
  messageApi: MessageInstance;
  isDeleteAction: boolean;
  handleRevalidate?: () => void;
};

const ModalCreateJourney = ({
  visible,
  onClose,
  selectedTrip,
  nextJourneyOrder,
  idTransferRequest,
  mode,
  setOrders,
  messageApi,
  isDeleteAction,
  handleRevalidate
}: ModalCreateJourneyProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formMode, setFormMode] = useState<FormMode>(FormMode.CREATION);
  const [defaultValues, setDefaultValues] = useState<JourneyFormValues>(defaultJourneyValues);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isValid },
    reset
  } = useForm<JourneyFormValues>({
    resolver: yupResolver(journeySchema) as any,
    defaultValues
  });
  const next = () => setCurrentStep(currentStep + 1);
  const prev = () => setCurrentStep(currentStep - 1);

  const formValues = watch();
  const currentTypeActive = watch("typeActive");

  useEffect(() => {
    const resetForm = () => {
      setFormMode(FormMode.CREATION);
      setCurrentStep(0);
      reset(defaultJourneyValues);
    };
    const setFormValuesWithSelectedTrip = (selectedTrip: Journey) => {
      const formValuesForEdition = createFormValues(selectedTrip);
      setDefaultValues(formValuesForEdition);
      reset(formValuesForEdition);
    };
    const setFormForEdition = (trip: Journey) => {
      setFormValuesWithSelectedTrip(trip);
      setFormMode(FormMode.EDITION);
    };
    const setFormForDelete = (trip: Journey) => {
      setCurrentStep(2);
      setFormValuesWithSelectedTrip(trip);
      setFormMode(FormMode.DELETE);
    };

    if (visible) {
      if (selectedTrip) {
        if (isDeleteAction) setFormForDelete(selectedTrip);
        else setFormForEdition(selectedTrip);
      } else {
        resetForm();
        setValue("order_to", nextJourneyOrder);
      }
    } else {
      resetForm();
    }
  }, [selectedTrip, visible, isDeleteAction, reset]);

  const modifyOrders = (
    formMode: FormMode,
    journeys: ITrackingResponse[],
    formValues: Journey
  ): ITrackingResponse[] => {
    switch (formMode) {
      case "CREATION":
        return [...journeys, { ...formValues }];
      case "EDITION":
        return journeys.map((order, index) =>
          order.order_to === formValues?.order_to
            ? { ...formValues }
            : { ...order, order_to: index + 1 }
        );
      case "DELETE": {
        const filteredJourneys = journeys.filter(
          (order) => order.order_to !== formValues?.order_to
        );
        return filteredJourneys.map((order, index) => ({
          ...order,
          order_to: index + 1
        }));
      }
      default:
        return journeys;
    }
  };

  const handleSaveOrder = (formValues: JourneyFormValues) => {
    setOrders((prevOrders) => {
      if (prevOrders)
        return {
          orders: [...prevOrders.orders],
          tracking: modifyOrders(formMode, prevOrders.tracking, createDataSoftSave(formValues))
        };
    });
  };

  async function handleJourneyActions(
    formMode: FormMode,
    journeyData: JourneyFormValues,
    idTransferRequest: number,
    setIsLoadingSubmit: Dispatch<SetStateAction<boolean>>
  ): Promise<void> {
    try {
      switch (formMode) {
        case FormMode.CREATION:
          if (idTransferRequest) {
            const newJourney = await createJourney(
              journeyData,
              idTransferRequest,
              setIsLoadingSubmit
            );
            setOrders((prevOrders) => {
              if (prevOrders)
                return {
                  orders: [...prevOrders.orders],
                  tracking: modifyOrders(formMode, prevOrders.tracking, {
                    ...newJourney,
                    order_to: newJourney.order_tr ?? 0,
                    type_service_desc: getServiceDescription(newJourney.id_type_service)
                  })
                };
            });
          }
          break;
        case FormMode.EDITION:
          if (idTransferRequest) {
            const updatedJourney = await updateJourney(
              journeyData,
              idTransferRequest,
              setIsLoadingSubmit
            );
            console.log("updatedJourney", updatedJourney);
            setOrders((prevOrders) => {
              if (prevOrders)
                return {
                  orders: [...prevOrders.orders],
                  tracking: modifyOrders(formMode, prevOrders.tracking, {
                    ...updatedJourney,
                    order_to: updatedJourney.order_tr ?? 0,
                    type_service_desc: getServiceDescription(updatedJourney.id_type_service)
                  })
                };
            });
          }
          break;
        case FormMode.DELETE:
          if (journeyData?.id && idTransferRequest) {
            await deleteJourney(journeyData.id, idTransferRequest, setIsLoadingSubmit);
            handleSaveOrder(journeyData);
          } else {
            console.error("No se pudo encontrar el trip seleccionado para eliminar.");
          }
          break;

        default:
          console.error("Modo de formulario inválido.");
      }
    } catch (error) {
      console.error("Error al ejecutar la acción del journey:", error);
    }
  }

  const getSuccessMessage = (formMode: FormMode) => {
    switch (formMode) {
      case FormMode.CREATION:
        return "Trayecto agregado correctamente";
      case FormMode.EDITION:
        return "Trayecto actualizado correctamente";
      case FormMode.DELETE:
        return "Trayecto eliminado correctamente";
      default:
        break;
    }
  };

  const onSubmit = async (data: JourneyFormValues) => {
    const successMessage = messageApi.open({
      type: "success",
      content: getSuccessMessage(formMode)
    });

    if (mode === MODE_PRICING.MERGE) {
      handleSaveOrder(data);
      successMessage.then(() => {
        onClose();
      });
    } else {
      await handleJourneyActions(formMode, data, idTransferRequest, setIsLoadingSubmit);
      successMessage.then(() => {
        onClose();
        handleRevalidate && handleRevalidate();
      });
    }
  };

  const adjustDateTime = () => {
    setValue("startDate", combineDateTimeDayjs(formValues.startDate, formValues.startTime));
    setValue("endDate", combineDateTimeDayjs(formValues.endDate, formValues.endTime));
  };

  const steps = [
    {
      title: "Tipo de viaje",
      content: (
        <TypeOfTrip
          typeActive={currentTypeActive}
          handleTypeClick={(type) => setValue("typeActive", type)}
          handleBack={onClose}
          handleNext={next}
          disabled={formMode === FormMode.EDITION}
        />
      ),
      footer: <></>
    },
    {
      title: "Agendamiento",
      content: (
        <Booking
          handleBack={onClose}
          handleNext={() => {
            if (formMode === FormMode.CREATION) {
              adjustDateTime();
              handleSubmit(onSubmit)();
            } else {
              next();
            }
          }}
          typeActive={currentTypeActive}
          selectedTrip={selectedTrip}
          register={register}
          watch={watch}
          control={control}
          setValue={setValue}
          isValid={isValid}
          formMode={formMode}
          isLoadingSubmit={isLoadingSubmit}
        />
      ),
      footer: <></>
    },
    {
      title: `Confirmar ${formMode === FormMode.EDITION ? "edición" : "eliminación"} de trayecto`,
      content:
        formMode === FormMode.EDITION
          ? generateEditConfirmationMessage(
              currentTypeActive,
              {
                origin: {
                  location: selectedTrip?.start_location_desc,
                  dateTime: selectedTrip?.start_date ?? ""
                },
                destination: {
                  location: selectedTrip?.end_location_desc,
                  dateTime: selectedTrip?.end_date ?? ""
                }
              },
              {
                origin: {
                  location: formValues?.origin?.description,
                  dateTime:
                    combineDateTimeDayjs(
                      formValues?.startDate,
                      formValues.startTime
                    ).toISOString() ?? ""
                },
                destination: {
                  location: formValues?.destination?.description,
                  dateTime:
                    combineDateTimeDayjs(formValues?.endDate, formValues.endTime).toISOString() ??
                    ""
                }
              }
            )
          : generateDeleteConfirmationMessage(currentTypeActive, {
              origin: {
                location: selectedTrip?.start_location_desc,
                dateTime: selectedTrip?.start_date ?? ""
              },
              destination: {
                location: selectedTrip?.end_location_desc,
                dateTime: selectedTrip?.end_date ?? ""
              }
            }),
      footer: (
        <FooterButtons
          backTitle="Cancelar"
          nextTitle="Siguiente"
          handleBack={() => {
            if (formMode === FormMode.EDITION) prev();
            else onClose();
          }}
          handleNext={() => {
            adjustDateTime();
            if (formMode === FormMode.EDITION) {
              handleSubmit(onSubmit)();
            } else {
              onSubmit(formValues);
            }
          }}
          nextDisabled={false}
          isSubmitting={isLoadingSubmit}
        />
      )
    }
  ];

  const Title = ({ title }: { title: string }) => {
    return (
      <Flex justify="space-between">
        <p className={styles.actionTitle}>{title}</p>
      </Flex>
    );
  };

  return (
    <Modal
      centered
      open={visible}
      width={698}
      styles={{
        body: {
          maxHeight: "85vh",
          overflowY: "auto",
          paddingTop: 24,
          scrollbarWidth: "none" /* Firefox */,
          msOverflowStyle: "none" /* Internet Explorer 10+ */
        }
      }}
      onClose={onClose}
      closeIcon={<X size={20} weight="bold" onClick={onClose} />}
      title={<Title title={steps[currentStep].title} />}
      footer={steps[currentStep].footer}
    >
      {steps[currentStep].content}
    </Modal>
  );
};

export default ModalCreateJourney;
