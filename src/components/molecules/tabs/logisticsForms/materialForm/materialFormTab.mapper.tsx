import { FileObject } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import { DocumentCompleteType } from "@/types/logistics/certificate/certificate";
import {
  ICertificates,
  IMaterial,
  IMaterialTransportType,
  IMaterialType
} from "@/types/logistics/schema";
import { IFormProject } from "@/types/projects/IFormProject";
import Title from "antd/es/typography/Title";
import dayjs from "dayjs";
import { SetStateAction } from "react";
import { UseFormSetValue } from "react-hook-form";

export type StatusForm = "review" | "create" | "edit";
export interface MaterialFormTabProps {
  idProjectForm?: string;
  data?: MaterialData;
  disabled?: boolean;
  onEditProject?: () => void;
  onSubmitForm?: (data: any) => void;
  onActiveMaterial?: () => void;
  onDesactivateMaterial?: () => void;
  statusForm: "create" | "edit" | "review";
  params: {
    id: string;
    materialId: string;
  };
  handleFormState?: (newFormState: StatusForm) => void;
  isLoadingSubmit: boolean;
  materialsTypesData: IMaterialType[];
  materialsTransportTypesData: IMaterialTransportType[];
}

export interface MaterialImage {
  id: number;
  entity_type: number;
  url_archive?: string;
  file?: FileObject;
}
export type MaterialData = IMaterial & { images?: MaterialImage[] };

export const dataToProjectFormData = (data: any): any => {
  if (!data) return {};

  const images = data.images?.map((image: any) => {
    const fileData = image.data;
    const fileName = image.url_archive.split("/").pop();
    const file = new File([fileData], fileName);
    (file as any).url_archive = image.url_archive;
    return file;
  });

  return {
    general: {
      id: data.id,
      description: data.description,
      id_type_material: data.id_type_material,
      kg_weight: data.kg_weight,
      mt_height: data.mt_height,
      mt_width: data.mt_width,
      mt_length: data.mt_length,
      m3_volume: data.m3_volume,
      rotation: data.rotation,
      can_stack: data.can_stack,
      image: data.image,
      aditional_info: data.aditional_info,
      active: data.active,
      created_at: data.created_at,
      created_by: data.created_by,
      modified_at: data.created_at,
      modified_by: data.created_by,
      icon: data.icon,
      restriction: data.restriction,
      code_sku: data.code_sku
    },
    images: images,
    IS_ACTIVE: data.active
  };
};

export const _onSubmit = (
  data: any,
  imageFiles: { docReference: string; file: File }[],
  setImageError: (value: SetStateAction<boolean>) => void,
  setloading: (value: SetStateAction<boolean>) => void,
  onSubmitForm: (data: any) => void
) => {
  setloading(true);
  try {
    setImageError(false);
    onSubmitForm({ ...data, images: imageFiles });
  } catch (error) {
    console.warn({ error });
  } finally {
    setloading(false);
  }
};

export const validationButtonText = (statusForm: "create" | "edit" | "review") => {
  switch (statusForm) {
    case "create":
      return "Crear nuevo material";
    case "edit":
      return "Guardar Cambios";
    case "review":
      return "Editar material";
  }
};

export const TitleFormTab = (title: string, level: 1 | 2 | 5 | 3 | 4 | undefined) => {
  return (
    <Title className="title" level={level}>
      {title}
    </Title>
  );
};
