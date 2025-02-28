import { FileObject } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import { IBillingPeriodForm } from "@/types/billingPeriod/IBillingPeriod";
import {
  IAPICarrier,
  ICarrier,
  ICertificates,
  IFormCarrier,
  ITripType
} from "@/types/logistics/schema";
import { IFormProject } from "@/types/projects/IFormProject";
import Title from "antd/es/typography/Title";
import { SetStateAction } from "react";
import { UseFormReset, UseFormSetValue } from "react-hook-form";
import { StatusForm } from "../driverForm/driverFormTab.mapper";

export interface CarrierFormTabProps {
  idProjectForm?: string;
  data?: IAPICarrier[];
  disabled?: boolean;
  onEditProject?: () => void;
  onSubmitForm?: (data: any) => void;
  onActiveProject?: () => void;
  onDesactivateProject?: () => void;
  statusForm: "create" | "edit" | "review";
  handleFormState?: (newFormState: StatusForm) => void;
  tripTypes: ITripType[];
  onActiveProvider?: () => void;
  onDesactivateProvider?: () => void;
  onAuditProvider?: () => void;
  isLoadingSubmit: boolean;
}

export type CarrierData = ICarrier & { documents?: ICertificates[] };

export const dataToProjectFormData = (data: IAPICarrier): IFormCarrier => {
  return {
    general: {
      id: data.id,
      description: data.description,
      nit: data.nit,
      icon: data.icon,
      active: data.active,
      vehicles: data.vehicles,
      drivers: data.drivers,
      carrier_type: data.carrier_type,
      created_at: data.created_at,
      created_by: data.created_by,
      photo: data.photo,
      trip_type:
        data.features?.map((feature) => ({
          label: feature.description,
          value: feature.id
        })) ?? [],
      status: data.status
    }
  };
};

export const _onSubmit = (
  data: any,
  setloading: (value: SetStateAction<boolean>) => void,
  setImageError: (value: SetStateAction<boolean>) => void,
  imageFile: FileObject[] | undefined,
  files: FileObject[] | undefined,
  onSubmitForm: (data: any) => void,
  reset: UseFormReset<IFormCarrier>,
  isImageMandatory: boolean
) => {
  setloading(true);
  try {
    if (!imageFile && isImageMandatory) return setImageError(true);
    setImageError(false);
    onSubmitForm({ ...data, logo: imageFile, files });
    reset(data);
    setloading(false);
  } catch (error) {
    console.warn({ error });
    setloading(false);
  }
};

export const effectFunction = (
  generalDSOCurrentlyYear: string,
  setValue: UseFormSetValue<IFormProject>,
  billingPeriod: IBillingPeriodForm | undefined
) => {
  if (generalDSOCurrentlyYear === "Sí") {
    setValue("general.DSO_days", undefined);
  }
  if (billingPeriod) setValue("general.billing_period", JSON.stringify(billingPeriod));
};

export const validationButtonText = (statusForm: "create" | "edit" | "review") => {
  switch (statusForm) {
    case "create":
      return "Crear nuevo proveedor";
    case "edit":
      return "Guardar Cambios";
    case "review":
      return "Editar proveedor";
  }
};

export const TitleFormTab = (title: string, level: 1 | 2 | 5 | 3 | 4 | undefined) => {
  return (
    <Title className="title" level={level}>
      {title}
    </Title>
  );
};
