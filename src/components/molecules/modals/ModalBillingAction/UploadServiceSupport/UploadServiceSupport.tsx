import { Button, Flex, message } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus } from "phosphor-react";

import { getTripDetails, IGetTripDetails, postAddMTTRipTracking } from "@/services/trips/trips";

import FooterButtons from "../FooterButtons/FooterButtons";
import { DocumentButton } from "@/components/atoms/DocumentButton/DocumentButton";
import useFileHandlers from "@/components/hooks/useFIleHandlers";

import styles from "./UploadServiceSupport.module.scss";

interface IFormUplaodServiceSupport {
  attachments: File[];
  commentary: string;
}

interface IUploadServiceSupportProps {
  onClose: () => void;
  tripId?: number;
}

const UploadServiceSupport = ({ onClose, tripId }: IUploadServiceSupportProps) => {
  const [trips, setTrips] = useState<IGetTripDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    reset,
    watch,
    trigger
  } = useForm<IFormUplaodServiceSupport>({
    defaultValues: {
      attachments: []
    }
  });
  const attachments = watch("attachments");

  const { handleOnChangeDocument, handleOnDeleteDocument, handleFileChange } = useFileHandlers({
    setValue,
    trigger,
    attachments
  });

  const handleOnChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue("commentary", e.target.value);
  };

  const onSubmit = async (data: IFormUplaodServiceSupport) => {
    setIsLoading(true);
    try {
      const documentsMTs = attachments.map((file, i) => ({
        tripId: trips[0].id,
        file: `MT-${i + 1}`
      }));
      await postAddMTTRipTracking({
        idTrip: trips[0].id,
        documentsMTs,
        commentary: data.commentary,
        files: attachments
      });
      message.success("Documentos cargados correctamente.");
      onClose();
    } catch (error) {
      console.error("Error uploading documents:", error);
      message.error("Error subiendo documentos.");
    }
    console.info("data", data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTripDetails();
    return () => {
      reset();
    };
  }, []);

  const fetchTripDetails = async () => {
    try {
      const response = await getTripDetails(tripId || 0);
      if (response) {
        setTrips([response]);
      }
    } catch (error) {
      console.error("Error fetching trip details:", error);
    }
  };

  return (
    <>
      <div className={styles.content}>
        <p className={styles.content__info}>Ingresa la información para legalizar el viaje</p>

        {trips.map((trip, index) => (
          <>
            <strong className={styles.content__detail}>Vehículo {trip.plate_number}</strong>
            <div className={styles.content__docsContainer}>
              {attachments.length === 0 && (
                <div className={styles.content__doc}>
                  <Flex vertical>
                    <p>Documento MT {index + 1}</p>
                    <em className="descriptionDocument">*Obligatorio</em>
                  </Flex>
                  <Flex vertical gap={"1rem"}>
                    <DocumentButton
                      title={attachments[0]?.name}
                      handleOnChange={handleOnChangeDocument}
                      handleOnDelete={() => handleOnDeleteDocument(attachments[0]?.name)}
                      fileName={attachments[0]?.name}
                      fileSize={attachments[0]?.size}
                    />
                  </Flex>
                </div>
              )}

              {attachments.length > 0 &&
                attachments.map((file, j) => (
                  <div className={styles.content__doc}>
                    <Flex vertical>
                      <p>Documento MT {j + 1}</p>
                      <em className="descriptionDocument">*Obligatorio</em>
                    </Flex>
                    <DocumentButton
                      key={file.name}
                      className={styles.documentButton}
                      title={file.name}
                      handleOnChange={handleOnChangeDocument}
                      handleOnDelete={() => handleOnDeleteDocument(file.name)}
                      fileName={file.name}
                      fileSize={file.size}
                    />
                  </div>
                ))}
            </div>
            {attachments.length > 0 && (
              <>
                <Button
                  onClick={() => {
                    const fileInput = document.getElementById("fileInput");
                    if (fileInput) {
                      fileInput.click();
                    }
                  }}
                  className={styles.content__addDocument}
                  icon={<Plus size={"1rem"} weight="bold" />}
                >
                  <p>Agregar otro documento</p>
                </Button>
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept=".pdf,.png,.doc,.docx"
                />
              </>
            )}
          </>
        ))}
      </div>
      <div className={styles.content__comment}>
        <Flex vertical style={{ width: "100%" }}>
          <p>Comentarios</p>
          <textarea onChange={handleOnChangeTextArea} placeholder="Comentarios adicionales" />
        </Flex>
      </div>

      <FooterButtons
        isConfirmDisabled={!isValid || attachments.length === 0 || !watch("commentary")}
        titleConfirm="Cargar soportes"
        onClose={onClose}
        handleOk={handleSubmit(onSubmit)}
        isConfirmLoading={isLoading}
      />
    </>
  );
};
export default UploadServiceSupport;
