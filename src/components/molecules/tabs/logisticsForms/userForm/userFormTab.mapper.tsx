import { FileObject } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import { DocumentCompleteType } from "@/types/logistics/certificate/certificate";
import { IFormUser, IUser } from "@/types/logistics/schema";
import Title from "antd/es/typography/Title";
import dayjs from "dayjs";
import { SetStateAction } from "react";
import { UseFormSetValue } from "react-hook-form";

export type StatusForm = "review" | "create" | "edit";
export interface UserFormTabProps {
  idProjectForm?: string;
  data?: UserData;
  disabled?: boolean;
  onEditProject?: () => void;
  onSubmitForm?: (data: any) => void;
  onActiveUser?: () => void;
  onDesactivateUser?: () => void;
  statusForm: "create" | "edit" | "review";
  params: {
    id: string;
    userId: string;
  };
  handleFormState?: (newFormState: StatusForm) => void;
  isLoadingSubmit: boolean;
}

export type UserData = IUser;

export type ApiVehicleType = { id_vehicle_type: number };

export const dataToProjectFormData = (data: any): IFormUser => {
  //console.log(data)
  return {
    logo: [],
    general: {
      id: data.ID,
      email: data.EMAIL,
      user_name: data.USER_NAME,
      phone: data.PHONE,
      rol_id: data.ROL_ID,
      carrier_id: data.carrier_id,
      psl_id: data.psl_id,
      cost_center_id: data.cost_center_id,
      active: data.ACTIVE,
      photo: data.PHOTO,
      firebaseguid: data.UUID,
      carrier: data.carrier,
      position: data.POSITION,
      psl: data.psl,
      ACTIVE: data.ACTIVE
    }
  };
};

export const _onSubmit = (
  data: any,
  imageFile: FileObject[] | undefined,
  setImageError: (value: SetStateAction<boolean>) => void,
  setloading: (value: SetStateAction<boolean>) => void,
  onSubmitForm: (data: any) => void
) => {
  setloading(true);
  try {
    // const hasImage = imageFile || data.general.photo;
    // if (!hasImage) return setImageError(true);
    onSubmitForm({ ...data, logo: imageFile });
  } catch (error) {
    console.warn({ error });
  } finally {
    setloading(false);
  }
};

export const validationButtonText = (statusForm: "create" | "edit" | "review") => {
  switch (statusForm) {
    case "create":
      return "Crear nuevo usuario";
    case "edit":
      return "Guardar Cambios";
    case "review":
      return "Editar conductor";
  }
};

export const TitleFormTab = (title: string, level: 1 | 2 | 5 | 3 | 4 | undefined) => {
  return (
    <Title className="title" level={level}>
      {title}
    </Title>
  );
};
