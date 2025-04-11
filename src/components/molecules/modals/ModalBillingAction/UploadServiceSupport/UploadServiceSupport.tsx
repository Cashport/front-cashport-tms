import { Button, Flex, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Plus } from "phosphor-react";

import { getTripDetails, IGetTripDetails, postAddMTTRipTracking } from "@/services/trips/trips";

import FooterButtons from "../FooterButtons/FooterButtons";
import { DocumentButton } from "@/components/atoms/DocumentButton/DocumentButton";

import { IJourney } from "@/types/logistics/schema";

import styles from "./UploadServiceSupport.module.scss";

interface IFormUplaodServiceSupport {
  tripAttachments: {
    [tripId: string]: {
      [mtName: string]: File;
    };
  };
  commentary: string;
}

interface IUploadServiceSupportProps {
  onClose: () => void;
  journeysData?: IJourney[];
}

const UploadServiceSupport = ({ onClose, journeysData }: IUploadServiceSupportProps) => {
  const [tripsDetails, setTripsDetails] = useState<IGetTripDetails[]>();
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
    formState: { errors, isValid },
    setValue,
    reset,
    watch,
    trigger
  } = useForm<IFormUplaodServiceSupport>({
    defaultValues: {
      tripAttachments: {}
    }
  });

  const handleOnChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue("commentary", e.target.value);
  };

  const onSubmit = async (data: IFormUplaodServiceSupport) => {
    setIsLoading({
      ...isLoading,
      request: true
    });
    try {
      // const documentsMTs = Object.keys(data.tripAttachments)?.map((tripKey, i) => ({
      //   tripId: tripKey,
      //   file: `MT-${i + 1}`
      // }));

      console.log("data", data);

      // await postAddMTTRipTracking({
      //   idTrip: trips?.[0]?.id ?? 0,
      //   documentsMTs: documentsMTs ?? [],
      //   commentary: data.commentary,
      //   files: attachments
      // });
      // message.success("Documentos cargados correctamente.");
      // onClose();
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
    fetchTripsDetails();
    return () => {
      reset();
    };
  }, []);

  const fetchTripsDetails = async () => {
    setIsLoading({
      ...isLoading,
      data: true
    });
    try {
      trips?.forEach(async (trip) => {
        const response = await getTripDetails(trip.id || 0);
        if (response) {
          setTripsDetails((prev) => {
            const isDuplicate = prev?.some((trip) => trip.id === response.id);
            if (!isDuplicate) {
              return [...(prev || []), response];
            }
            return prev || [];
          });
        }
      });
    } catch (error) {
      console.error("Error fetching trip details:", error);
      message.error("Error fetching trip details.");
    } finally {
      setIsLoading({
        ...isLoading,
        data: false
      });
    }
  };

  return (
    <>
      <div className={styles.content}>
        <p className={styles.content__info}>Ingresa la información para legalizar el viaje</p>

        <div className={styles.content__tripsContainer}>
          {tripsDetails?.map((trip) => {
            const fieldName = `tripAttachments.${trip.id}` as const;
            const inputId = `fileInput-${trip.id}`;

            return (
              <Flex key={trip.id} vertical gap={"1rem"}>
                <strong className={styles.content__detail}>Vehículo {trip.plate_number}</strong>
                <Flex vertical gap={"1rem"} className={styles.content__}>
                  <Controller
                    name={fieldName}
                    control={control}
                    render={({ field }) => {
                      const currentFiles: Record<string, File> = field.value || {};

                      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const backendCount = trip.MT.length;
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
                            {trip.MT.map((url, j) => {
                              const displayName = url.split(".com/").pop() || `MT ${j}`;
                              return (
                                <div key={`${trip.id}-url-${j}`} className={styles.content__doc}>
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
                                    disabled
                                  />
                                </div>
                              );
                            })}

                            {/* Archivos subidos localmente */}
                            {Object.entries(currentFiles).map(([key, file], idx) => (
                              <div
                                key={`${trip.id}-${file.name}-${idx}`}
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
                            {trip.MT.length === 0 && Object.keys(currentFiles).length === 0 && (
                              <>
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
                                      console.log("info", info);
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
                              </>
                            )}
                          </Flex>

                          {/* Botón para agregar otro */}
                          {(trip.MT.length > 0 || Object.keys(currentFiles).length > 0) && (
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
                                accept=".pdf,.png,.doc,.docx"
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
      <div className={styles.content__comment}>
        <Flex vertical style={{ width: "100%" }}>
          <p>Comentarios</p>
          <textarea onChange={handleOnChangeTextArea} placeholder="Comentarios adicionales" />
        </Flex>
      </div>

      <FooterButtons
        isConfirmDisabled={!isValid || !watch("commentary")}
        titleConfirm="Cargar soportes"
        onClose={onClose}
        handleOk={handleSubmit(onSubmit)}
        isConfirmLoading={isLoading.request}
      />
    </>
  );
};
export default UploadServiceSupport;
