/* eslint-disable no-unused-vars */
import { ChangeEvent } from "react";
import { UseFormSetValue, UseFormTrigger } from "react-hook-form";

type FileHandlerProps = {
  setValue: UseFormSetValue<any>;
  trigger: UseFormTrigger<any>;
  attachments: File[];
};

type FileHandlers = {
  handleOnChangeDocument: any;
  handleOnDeleteDocument: (fileName: string) => void;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

const useFileHandlers = ({ setValue, trigger, attachments }: FileHandlerProps): FileHandlers => {
  const validateFileSize = (file: File): boolean => {
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > 30) {
      console.error(
        "El archivo es demasiado grande. Por favor, sube un archivo de menos de 30 MB."
      );
      return false;
    }
    return true;
  };

  const handleOnChangeDocument = (info: { file: File; fileList: File[] }) => {
    const { file: rawFile } = info;
    if (rawFile && validateFileSize(rawFile)) {
      setValue("attachments", [...attachments, rawFile]);
      trigger("attachments");
    }
  };

  const handleOnDeleteDocument = (fileName: string) => {
    const updatedFiles = attachments.filter((file) => file.name !== fileName);
    setValue("attachments", updatedFiles);
    trigger("attachments");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFileSize(file)) {
        setValue("attachments", [...attachments, file]);
        trigger("attachments");
      }
    }
  };

  return {
    handleOnChangeDocument,
    handleOnDeleteDocument,
    handleFileChange
  };
};

export default useFileHandlers;
