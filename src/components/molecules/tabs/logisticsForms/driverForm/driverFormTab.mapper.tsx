import { FileObject } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import { IBillingPeriodForm } from "@/types/billingPeriod/IBillingPeriod";
import { CertificateType, DocumentCompleteType } from "@/types/logistics/certificate/certificate";
import { IAPIDriver, ICertificates, IFormDriver, VehicleType } from "@/types/logistics/schema";
import { IFormProject } from "@/types/projects/IFormProject";
import Title from "antd/es/typography/Title";
import dayjs from "dayjs";
import { UseFormSetValue } from "react-hook-form";
import utc from "dayjs/plugin/utc";
import { MessageInstance } from "antd/es/message/interface";
dayjs.extend(utc);

export type StatusForm = "review" | "create" | "edit";
export interface DriverFormTabProps {
  idProjectForm?: string;
  data?: DriverData;
  disabled?: boolean;
  onEditProject?: () => void;
  onSubmitForm?: (data: any) => void;
  onActiveProject?: () => Promise<void>;
  onDesactivateProject?: () => Promise<void>;
  onAuditDriver?: () => Promise<void>;
  statusForm: "create" | "edit" | "review";
  params: {
    id: string;
    driverId: string;
  };
  handleFormState?: (newFormState: StatusForm) => void;
  documentsTypesList: CertificateType[];
  vehiclesTypesList: VehicleType[];
  isLoadingSubmit: boolean;
}

export type DriverData = IAPIDriver & { licence?: string } & { documents?: ICertificates[] };

export type ApiVehicleType = { id_vehicle_type: number };

export const dataToProjectFormData = (
  data: any,
  vehiclesTypesData: VehicleType[] | undefined
): IFormDriver => {
  function createVehicleTypeArray(
    dataVehicleTypes: ApiVehicleType[],
    vehiclesTypesData: VehicleType[] | undefined
  ) {
    if (!vehiclesTypesData) return [];
    return dataVehicleTypes.map((vehicle) => {
      const vehicleType = vehiclesTypesData.find((type) => type.id === vehicle.id_vehicle_type);
      return {
        label: vehicleType ? vehicleType.description : "Unknown",
        value: vehicle.id_vehicle_type
      };
    });
  }

  const vehicleTypeArray = createVehicleTypeArray(data.vehicle_type, vehiclesTypesData);
  return {
    images: [],
    general: {
      id: data.id,
      phone: data.phone,
      email: data.email,
      document_type: data.document_type,
      document: data.document,
      license: data?.licence || data.license,
      license_category: data.licence_category || "",
      license_expiration: dayjs.utc(data.license_expiration || data.licence_expiration) as any,
      name: data.name,
      last_name: data.last_name,
      emergency_number: data.emergency_number,
      emergency_contact: data.emergency_contact,
      active: data.active,
      created_at: data.created_at,
      created_by: data.created_by,
      company: data.company,
      rh: data.rh,
      glasses: data.glasses,
      birth_date: dayjs(data?.birth_date) as any,
      photo: data.photo,
      vehicle_type: vehicleTypeArray,
      status: data.status,
      trip_type: []
    }
  };
};

export const _onSubmit = (
  data: any,
  files: DocumentCompleteType[],
  imageFile: FileObject[] | undefined,
  onSubmitForm: (data: any) => void
) => {
  try {
    onSubmitForm({ ...data, logo: imageFile, files });
  } catch (error) {
    console.warn({ error });
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
      return "Crear nuevo conductor";
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
