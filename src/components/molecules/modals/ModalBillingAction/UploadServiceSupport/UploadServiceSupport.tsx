import { Button, Flex } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus } from "phosphor-react";

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
}

const UploadServiceSupport = ({ onClose }: IUploadServiceSupportProps) => {
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

  const onSubmit = (data: IFormUplaodServiceSupport) => {
    setIsLoading(true);
    console.info("data", data);
    setIsLoading(false);
  };

  useEffect(() => {
    return () => {
      reset();
    };
  }, []);

  return (
    <>
      <div className={styles.content}>
        <p className={styles.content__info}>Ingresa la información para legalizar el viaje</p>

        <strong className={styles.content__detail}>Vehículo XXXXXX</strong>

        <div className={styles.content__docsContainer}>
          <Flex vertical>
            <p>Documento soporte</p>
            <em className="descriptionDocument">*Obligatorio</em>
          </Flex>
          <Flex vertical gap={"1rem"}>
            <div className={styles.content__docs}>
              <DocumentButton
                title={attachments[0]?.name}
                handleOnChange={handleOnChangeDocument}
                handleOnDelete={() => handleOnDeleteDocument(attachments[0]?.name)}
                fileName={attachments[0]?.name}
                fileSize={attachments[0]?.size}
              />
              {attachments.length > 0 &&
                attachments
                  .slice(1)
                  .map((file) => (
                    <DocumentButton
                      key={file.name}
                      className={styles.documentButton}
                      title={file.name}
                      handleOnChange={handleOnChangeDocument}
                      handleOnDelete={() => handleOnDeleteDocument(file.name)}
                      fileName={file.name}
                      fileSize={file.size}
                    />
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
          </Flex>
        </div>

        <div className={styles.content__comment}>
          <Flex vertical style={{ width: "100%" }}>
            <p>Comentarios</p>
            <textarea onChange={handleOnChangeTextArea} placeholder="Comentarios adicionales" />
          </Flex>
        </div>
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
