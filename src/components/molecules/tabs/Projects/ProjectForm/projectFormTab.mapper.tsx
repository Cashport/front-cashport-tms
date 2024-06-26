import { IBillingPeriodForm } from "@/types/billingPeriod/IBillingPeriod";
import { IFormProject } from "@/types/projects/IFormProject";
import { IProject } from "@/types/projects/IProject";
import Title from "antd/es/typography/Title";
import { SetStateAction } from "react";
import { UseFormReset, UseFormSetValue } from "react-hook-form";

export interface ProjectFormTabProps {
  idProjectForm?: string;
  data?: IProject;
  disabled?: boolean;
  onEditProject?: () => void;
  onSubmitForm?: (data: any) => void;
  onActiveProject?: () => void;
  onDesactivateProject?: () => void;
  statusForm: "create" | "edit" | "review";
}

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
export const newBillingPeriod = (config: IBillingPeriodForm): string => {
  if (config) {
    if (config.day_flag !== "false" && config.day) return `${config.day}`;
    return `El ${config.order} ${config.day_of_week}`;
  }
  return "";
};
export const dataToProjectFormData = (data: IProject): IFormProject => {
  const currenciesFormated = data?.CURRENCY?.map((currency) => ({
    value: currency.id,
    label: currency.CURRENCY_NAME
  }));
  return {
    logo: data.LOGO,
    general: {
      name: data.NAME,
      nit: data.NIT,
      currencies: currenciesFormated,
      country: { value: data.COUNTRY_ID, label: data.COUNTRY_NAME },
      address: data.ADDRESS,
      billing_period: newBillingPeriod(data.BILLING_PERIOD_CONFIG),
      DSO_currenly_year: data.DSO_CURRENLY_YEAR === 0 ? "No" : "Sí",
      DSO_days: data.DSO_DAYS,
      accept_date: data?.ACCEPT_DATE === 0 ? "Fecha de emisión" : "Fecha de aceptación"
    },
    contact: {
      name: data.CONTACT,
      position_contact: data.POSITION_CONTACT,
      email: data.EMAIL,
      phone: data.PHONE
    },
    personalization: {
      color: data.RGB_CONFIG,
      description: data.PROJECT_DESCRIPTION
    }
  };
};

export const _onSubmit = (
  data: any,
  setloading: (value: SetStateAction<boolean>) => void,
  setImageError: (value: SetStateAction<boolean>) => void,
  imageFile: string,
  onSubmitForm: (data: any) => void,
  reset: UseFormReset<IFormProject>
) => {
  setloading(true);
  try {
    if (!imageFile) return setImageError(true);
    setImageError(false);
    onSubmitForm({ ...data, logo: imageFile });
    reset(data);
    setloading(false);
  } catch (error) {
    console.warn({ error });
    setloading(false);
  }
};

export const validationButtonText = (statusForm: "create" | "edit" | "review") => {
  switch (statusForm) {
    case "create":
      return "Crear nuevo proyecto";
    case "edit":
      return "Guardar Cambios";
    case "review":
      return "Editar Proyecto";
  }
};

export const TitleFormTab = (title: string, level: 1 | 2 | 5 | 3 | 4 | undefined) => {
  return (
    <Title className="title" level={level}>
      {title}
    </Title>
  );
};
