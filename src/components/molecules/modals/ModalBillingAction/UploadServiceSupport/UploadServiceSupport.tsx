import { Button, Flex, message, Spin } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Plus } from "phosphor-react";

import {
  getCarriersTripsDetails,
  getTripDetails,
  getTripsDetailsByCarrier,
  IGetTripDetails,
  postAddMTTRipTracking
} from "@/services/trips/trips";
import { FILE_EXTENSIONS } from "@/utils/constants/globalConstants";

import FooterButtons from "../FooterButtons/FooterButtons";
import { DocumentButton } from "@/components/atoms/DocumentButton/DocumentButton";

import { IJourney } from "@/types/logistics/schema";

import styles from "./UploadServiceSupport.module.scss";
import {
  ICarrierAPI,
  IRequestAPI,
  IVehicleAPI
} from "../../ModalGenerateActionTO/FinalizeTrip/FinalizeTrip";

interface IFormUplaodServiceSupport {
  tripAttachments: {
    [tripId: string]: {
      [mtName: string]: File;
    };
  };
  otherRequirementsAttachment: {
    [otherId: string]: {
      [mtName: string]: File;
    };
  };
  commentary: string;
}

interface IUploadServiceSupportProps {
  onClose: () => void;
  journeysData?: IJourney[];
  trId: number;
  carrierId: number;
}

const UploadServiceSupport = ({
  onClose,
  journeysData,
  trId,
  carrierId
}: IUploadServiceSupportProps) => {
  const [tripsDetails, setTripsDetails] = useState<ICarrierAPI>();
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const trips = useMemo(
    () => journeysData?.flatMap((journey) => journey.trips.map((trip) => trip)),
    [journeysData]
  );

  const [isLoading, setIsLoading] = useState({
    data: false,
    request: false
  });

  const {
    control,
    handleSubmit,
    formState: { isValid },
    setValue,
    reset,
    watch,
    trigger
  } = useForm<IFormUplaodServiceSupport>({
    defaultValues: {
      tripAttachments: {},
      otherRequirementsAttachment: {}
    }
  });

  const tripAttachments = watch("tripAttachments");
  const otherRequirementsAttachment = watch("otherRequirementsAttachment");

  const handleOnChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue("commentary", e.target.value);
  };

  const onSubmit = async (data: IFormUplaodServiceSupport) => {
    setIsLoading({
      ...isLoading,
      request: true
    });
    try {
      const attachments: {
        name: string;
        file: File;
      }[] = [];

      const documentsMTs = Object.entries(data.tripAttachments).flatMap(([tripId, filesObj], i) => {
        if (!filesObj || typeof filesObj !== "object") return [];

        return Object.keys(filesObj).map((fileName, j) => {
          const finalName = `MT-trip-${i}`;
          attachments.push({
            name: `${finalName}-${j}`,
            file: filesObj[fileName]
          });
          return {
            tripId: Number(tripId),
            file: `${finalName}-${j}`
          };
        });
      });

      const otherRequirementsAttachments = Object.entries(data.otherRequirementsAttachment).flatMap(
        ([otId, filesObj], i) => {
          if (!filesObj || typeof filesObj !== "object") return [];

          return Object.keys(filesObj).map((fileName, j) => {
            const finalName = `MT-other-${i}`;
            attachments.push({
              name: `${finalName}-${j}`,
              file: filesObj[fileName]
            });
            return {
              otId: Number(otId),
              file: `${finalName}-${j}`
            };
          });
        }
      );

      await postAddMTTRipTracking({
        trId: trId || 0,
        documentsMTs: documentsMTs ?? [],
        otherRequirementsAttachments: otherRequirementsAttachments ?? [],
        commentary: data.commentary,
        files: attachments
      });
      message.success("Documentos cargados correctamente.");
      onClose();
    } catch (error) {
      console.error("Error uploading documents:", error);
      message.error("Error subiendo documentos.");
    }
    setIsLoading({
      ...isLoading,
      request: false
    });
  };

  useEffect(() => {
    fetchAllServicesDetails();
    return () => {
      reset();
      setIsFirstLoad(true);
      setTripsDetails(undefined);
    };
  }, []);

  useEffect(() => {
    if (
      !isFirstLoad &&
      (!tripsDetails || (!tripsDetails?.requirements?.length && !tripsDetails?.vehicles?.length))
    ) {
      message.error("No se encontraron detalles de ningun viaje.");
    }
  }, [isFirstLoad]);

  const fetchAllServicesDetails = async () => {
    setIsLoading({
      ...isLoading,
      data: true
    });
    try {
      const data = await getTripsDetailsByCarrier(trId, carrierId);
      if (data) {
        setTripsDetails(data);
      }
    } catch (error) {
      console.error("Error fetching trip details:", error);
      message.error("Error fetching trip details.");
    }

    setIsFirstLoad(false);

    setIsLoading({
      ...isLoading,
      data: false
    });
  };

  const vehicles = tripsDetails?.vehicles || [];
  const requirements = tripsDetails?.requirements || [];
  interface ConcatedType
    extends Omit<IVehicleAPI, "plate_number">,
      Omit<IRequestAPI, "description"> {
    plate_number: string;
    isVehicle: boolean;
  }
  const concated: ConcatedType[] = vehicles
    .map((v) => ({
      ...v,
      isVehicle: true,
      plate_number: v.plate_number
    }))
    .concat(requirements.map((r) => ({ ...r, isVehicle: false, plate_number: r.description })));

  return (
    <>
      <div className={styles.content}>
        <p className={styles.content__info}>Ingresa la información para legalizar el viaje</p>

        <div className={styles.content__tripsContainer}>
          {concated.map((trip) => {
            const fieldName: `tripAttachments.${number}` | `otherRequirementsAttachment.${number}` =
              trip.isVehicle
                ? `tripAttachments.${trip.id}`
                : `otherRequirementsAttachment.${trip.id}`;
            const inputId = `fileInput-${trip.id}`;
            const description = trip.plate_number || "unknown";

            return (
              <Flex key={`${description}-${trip.id}`} vertical gap={"1rem"}>
                <strong className={styles.content__detail}>Vehículo {description}</strong>
                <Flex vertical gap={"1rem"} className={styles.content__}>
                  <Controller
                    name={fieldName}
                    control={control}
                    render={({ field }) => {
                      const currentFiles: Record<string, File> = field.value || {};

                      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const backendCount = trip.MT?.length || 0;
                        const existingUserCount = Object.keys(currentFiles).length;
                        const totalDocs = backendCount + existingUserCount;
                        const newKey = `MT ${totalDocs}`;

                        const updated = {
                          ...currentFiles,
                          [newKey]: file
                        };

                        setValue(fieldName, updated);
                        trigger(fieldName);
                      };

                      const handleFileDelete = (key: string) => {
                        const updated = { ...currentFiles };
                        delete updated[key];
                        setValue(fieldName, updated);
                        trigger(fieldName);
                      };

                      return (
                        <>
                          <Flex vertical gap={"1rem"}>
                            {/* Archivos previos cargados desde backend */}
                            {trip?.MT?.map((obj, j) => {
                              const displayName = obj.name;
                              return (
                                <div
                                  key={`${description}-${trip.id}-url-${j}`}
                                  className={styles.content__doc}
                                >
                                  <Flex vertical>
                                    <p>Documento MT {j}</p>
                                    <em className="descriptionDocument">*Obligatorio</em>
                                  </Flex>
                                  <DocumentButton
                                    title={displayName}
                                    fileName={displayName}
                                    fileSize=""
                                    handleOnChange={() => {}}
                                    handleOnDelete={() => {
                                      console.warn(
                                        "Eliminar archivo del backend aún no implementado"
                                      );
                                    }}
                                    deletable={false}
                                    handleOnClick={() => {
                                      window.open(obj.url, "_blank");
                                    }}
                                  />
                                </div>
                              );
                            })}

                            {/* Archivos subidos localmente */}
                            {Object.entries(currentFiles).map(([key, file], idx) => (
                              <div
                                key={`${description}-${trip.id}-${file.name}-${idx}`}
                                className={styles.content__doc}
                              >
                                <Flex vertical>
                                  <p>{key}</p>
                                  <em className="descriptionDocument">*Obligatorio</em>
                                </Flex>
                                <DocumentButton
                                  title={key}
                                  fileName={file.name}
                                  fileSize={file.size}
                                  handleOnChange={() => {}}
                                  handleOnDelete={() => handleFileDelete(key)}
                                  disabled={isLoading.request}
                                />
                              </div>
                            ))}

                            {/* Si no hay archivos del backend ni archivos locales, mostrar DocumentButton para el primer archivo */}
                            {!trip.MT?.length && Object.keys(currentFiles).length === 0 && (
                              <div className={styles.content__doc}>
                                <Flex vertical>
                                  <p>MT 0</p>
                                  <em className="descriptionDocument">*Obligatorio</em>
                                </Flex>
                                <DocumentButton
                                  title={"MT 0"}
                                  fileName={"Seleccionar archivo"}
                                  fileSize={""}
                                  handleOnChange={(info: any) => {
                                    const file = info.file;
                                    if (!file) return;

                                    const updated = {
                                      ...currentFiles,
                                      ["MT 0"]: file
                                    };

                                    setValue(fieldName, updated);
                                    trigger(fieldName);
                                  }}
                                  handleOnDelete={() => {
                                    const updated = { ...currentFiles };
                                    delete updated["MT 0"];
                                    setValue(fieldName, updated);
                                    trigger(fieldName);
                                  }}
                                  disabled={isLoading.request}
                                />
                              </div>
                            )}
                          </Flex>

                          {/* Botón para agregar otro */}
                          {(trip.MT?.length || Object.keys(currentFiles).length > 0) && (
                            <>
                              <Button
                                onClick={() => {
                                  const fileInput = document.getElementById(
                                    inputId
                                  ) as HTMLInputElement;
                                  if (fileInput) fileInput.click();
                                }}
                                className={styles.content__addDocument}
                                icon={<Plus size={"1rem"} weight="bold" />}
                              >
                                <p>Agregar otro documento</p>
                              </Button>
                              <input
                                id={inputId}
                                type="file"
                                style={{ display: "none" }}
                                onChange={handleFileChange}
                                accept={FILE_EXTENSIONS.join(",")}
                              />
                            </>
                          )}
                        </>
                      );
                    }}
                  />
                </Flex>
              </Flex>
            );
          })}
        </div>
      </div>
      {isLoading.data && !tripsDetails ? (
        <Flex justify="center" align="center" style={{ margin: "50px" }}>
          <Spin />
        </Flex>
      ) : (
        <div className={styles.content__comment}>
          <Flex vertical style={{ width: "100%" }}>
            <p>Comentarios</p>
            <textarea onChange={handleOnChangeTextArea} placeholder="Comentarios adicionales" />
          </Flex>
        </div>
      )}

      <FooterButtons
        isConfirmDisabled={
          !isValid ||
          !tripsDetails ||
          (!Object.values(tripAttachments || {}).some(
            (filesObj) => filesObj && Object.keys(filesObj).length > 0
          )
          && !Object.values(otherRequirementsAttachment || {}).some(
            (filesObj) => filesObj && Object.keys(filesObj).length > 0
          ))
        }
        titleConfirm="Cargar soportes"
        onClose={onClose}
        handleOk={handleSubmit(onSubmit)}
        isConfirmLoading={isLoading.request}
      />
    </>
  );
};
export default UploadServiceSupport;
