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
    [tripId: string]: File[];
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
      // const documentsMTs = trips?.map((trip, i) => ({
      //   tripId: trip.id,
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
    } finally {
      setIsLoading({
        ...isLoading,
        data: false
      });
    }
  };

  console.log("tripsDetails", tripsDetails);

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
                <div>
                  <Controller
                    name={fieldName}
                    control={control}
                    render={({ field }) => {
                      const currentFiles: File[] = field.value || [];

                      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const updated = [...currentFiles, file];
                        setValue(fieldName, updated);
                        trigger(fieldName);
                      };

                      const handleFileDelete = (idx: number) => {
                        const updated = [...currentFiles];
                        updated.splice(idx, 1);
                        setValue(fieldName, updated);
                        trigger(fieldName);
                      };

                      return (
                        <Flex vertical gap={"1rem"}>
                          <Flex vertical gap={"1rem"}>
                            {/* Archivos del backend */}
                            {trip.MT.map((url, j) => {
                              const displayName = url.split(".com/").pop() || `MT-${j}`;
                              return (
                                <div key={`${trip.id}-url-${j}`} className={styles.content__doc}>
                                  <Flex vertical>
                                    <p>Documento MT {j}</p>
                                    <em className="descriptionDocument">*Obligatorio</em>
                                  </Flex>
                                  <Flex vertical>
                                    <DocumentButton
                                      title={displayName}
                                      fileName={displayName}
                                      fileSize=""
                                      handleOnChange={() => {}}
                                      handleOnDelete={() => {
                                        console.warn(
                                          "Borrar archivo ya subido aún no implementado."
                                        );
                                      }}
                                      disabled
                                    />
                                  </Flex>
                                </div>
                              );
                            })}

                            {/* Archivos subidos localmente */}
                            {currentFiles.map((file, i) => (
                              <div
                                key={`${trip.id}-${file.name}-${i}`}
                                className={styles.content__doc}
                              >
                                <Flex vertical>
                                  <p>Documento MT {i + 1}</p>
                                  <em className="descriptionDocument">*Obligatorio</em>
                                </Flex>
                                <Flex vertical>
                                  <DocumentButton
                                    title={`MT-${i}`}
                                    fileName={file.name}
                                    fileSize={file.size}
                                    handleOnChange={() => {}}
                                    handleOnDelete={() => handleFileDelete(i)}
                                    disabled={isLoading.request}
                                  />
                                </Flex>
                              </div>
                            ))}
                          </Flex>

                          {/* Botón para agregar otro */}
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
                        </Flex>
                      );
                    }}
                  />
                </div>
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
