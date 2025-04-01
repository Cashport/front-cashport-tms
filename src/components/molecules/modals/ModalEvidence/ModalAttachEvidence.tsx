/* eslint-disable no-unused-vars */
import React from "react";
import { Button, Flex, UploadFile } from "antd";
import { CaretLeft, Plus } from "@phosphor-icons/react";
import { DocumentButton } from "@/components/atoms/DocumentButton/DocumentButton";
import styles from "./modalAttachEvidence.module.scss";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

interface FileFromDragger {
  lastModified: number;
  lastModifiedDate: Date;
  name: string;
  originFileObj: File;
  percent: number;
  size: number;
  status: string;
  type: string;
  uid: string;
}

interface FileObjectFromButton {
  file: FileFromDragger;
  fileList: FileFromDragger[];
}

type customTexts = {
  title?: string;
  description?: string;
  cancelButtonText?: string;
  acceptButtonText?: string;
};

type EvidenceModalProps = {
  selectedEvidence: File[];
  setSelectedEvidence: React.Dispatch<React.SetStateAction<File[]>>;
  handleAttachEvidence: () => void;
  commentary?: string;
  setCommentary: React.Dispatch<React.SetStateAction<string | undefined>>;
  setShowEvidenceModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleCancel?: () => void;
  customTexts?: customTexts;
  multipleFiles?: boolean;
  noComment?: boolean;
};

const ModalAttachEvidence = ({
  selectedEvidence,
  setSelectedEvidence,
  handleAttachEvidence,
  setShowEvidenceModal,
  handleCancel,
  customTexts,
  noComment = false,
  commentary,
  setCommentary,
  multipleFiles = false
}: EvidenceModalProps) => {
  const isAttachButtonDisabled = !noComment
    ? !(commentary && selectedEvidence.length > 0)
    : selectedEvidence.length === 0;

  const handleOnChangeDocument: any = (info: FileObjectFromButton) => {
    const { file } = info;
    const rawFile = file.originFileObj;
    if (rawFile) {
      const fileSizeInMB = rawFile.size / (1024 * 1024);

      if (fileSizeInMB > 30) {
        alert("El archivo es demasiado grande. Por favor, sube un archivo de menos de 30 MB.");
        return;
      }

      setSelectedEvidence([...selectedEvidence, rawFile]);
    }
  };

  const handleOnDeleteDocument = (fileName: string) => {
    const updatedFiles = selectedEvidence?.filter((file) => file.name !== fileName);
    setSelectedEvidence(updatedFiles);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files as FileList);

    for (let i = 0; i < files.length; i++) {
      if (selectedEvidence.some((file) => file.name === files[i].name)) {
        alert("Ya existe un archivo con el mismo nombre");
        return;
      }
    }

    setSelectedEvidence((prevFiles) => [...prevFiles, ...files]);
  };

  const handleOnChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentary(e.target.value);
  };

  return (
    <div className={styles.content}>
      <button className={styles.content__header} onClick={() => setShowEvidenceModal(false)}>
        <CaretLeft size={"1.25rem"} />
        <h4>{customTexts?.title ? customTexts?.title : "Evidencia"}</h4>
      </button>
      <p className={styles.content__description}>
        {customTexts?.description
          ? customTexts?.description
          : "Adjunta la evidencia e ingresa un comentario"}
      </p>
      <div className={styles.content__evidence}>
        <Flex vertical>
          <p>Evidencia</p>
          <em className="descriptionDocument">*Obligatorio</em>
        </Flex>
        <DocumentButton
          title={selectedEvidence[0]?.name}
          handleOnChange={handleOnChangeDocument}
          handleOnDelete={() => handleOnDeleteDocument(selectedEvidence[0]?.name)}
          fileName={selectedEvidence[0]?.name}
          fileSize={selectedEvidence[0]?.size}
        />
        {selectedEvidence.length > 0 &&
          selectedEvidence
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
        {multipleFiles && selectedEvidence.length > 0 && (
          <>
            <Button
              onClick={() => {
                const fileInput = document.getElementById("fileInput");
                if (fileInput) {
                  fileInput.click();
                }
              }}
              className={styles.addDocument}
              icon={<Plus size={"1rem"} />}
            >
              <p>Cargar otro documento</p>
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

        <p>Comentarios</p>
        <textarea onChange={handleOnChangeTextArea} placeholder="Ingresar un comentario" />
      </div>

      <FooterButtons
        handleOk={handleAttachEvidence}
        onCancel={handleCancel}
        titleConfirm={
          customTexts?.acceptButtonText ? customTexts?.acceptButtonText : "Adjuntar evidencia"
        }
      />
    </div>
  );
};

export default ModalAttachEvidence;
