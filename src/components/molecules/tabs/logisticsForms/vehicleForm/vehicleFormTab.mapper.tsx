import {
  IVehicle,
  VihicleDetail,
  IFormVehicle,
  ICertificates,
  IListDataVehiche,
  VehicleType
} from "@/types/logistics/schema";
import { MessageInstance } from "antd/es/message/interface";
import Title from "antd/es/typography/Title";
import { SetStateAction } from "react";
import { UseFormReset, UseFormSetValue } from "react-hook-form";
import { CertificateType, DocumentCompleteType } from "@/types/logistics/certificate/certificate";
import { IFeature } from "@/types/features/feature";

export type StatusForm = "review" | "create" | "edit";

export interface VehicleFormTabProps {
  idVehicleForm?: string;
  data?: VehicleData;
  disabled?: boolean;
  onEditVehicle?: () => void;
  onSubmitForm?: (data: any) => void;
  handleFormState?: (newFormState: StatusForm) => void;
  onActiveVehicle?: () => void;
  onDesactivateVehicle?: () => void;
  onAuditVehicle?: () => void;
  statusForm: "create" | "edit" | "review";
  params: {
    id: string;
    vehicleId: string;
  };
  documentsTypesList: CertificateType[];
  vehiclesTypesList: VehicleType[];
  features: IFeature[];
  isLoading: boolean;
}
export interface VehicleImage {
  id: number;
  entity_type: number;
  url_archive?: string;
  file?: FileObject;
}

export type VehicleData = IVehicle & { licence?: string } & { documents?: ICertificates[] } & {
  images?: VehicleImage;
};

export interface FileObject {
  file: File;
  docReference?: string;
}

export const normalizeVehicleData = (data: any): any => {
  if (!data) return {};

  const documents = data.documents.map((doc: any) => ({
    file: {
      name: doc.url_archive.split("/").pop(),
      url: doc.url_archive
    }
  }));

  const images = data.images.map((image: any) => {
    const fileData = image.data;
    const fileName = image.url_archive.split("/").pop();
    const file = new File([fileData], fileName);
    (file as any).url_archive = image.url_archive;
    return file;
  });

  return {
    general: {
      id: data.id.toString(),
      id_carrier: data.id_carrier.toString(),
      id_vehicle_type: data.id_vehicle_type.toString(),
      vehicle_type: "", // Add logic to fetch vehicle type if necessary
      plate_number: data.plate_number,
      brand: data.brand,
      line: data.line,
      model: data.model,
      year: data.year,
      color: data.color,
      country: data.country.toString(),
      aditional_info: data.aditional_info,
      gps_link: data.gps_link === "undefined" ? "" : data.gps_link,
      gps_user: data.gps_user === "undefined" ? "" : data.gps_user,
      gps_password: data.gps_password === "undefined" ? "" : data.gps_password,
      active: data.active,
      created_at: new Date(data.created_at),
      created_by: data.created_by,
      modified_at: new Date(data.modified_at),
      modified_by: data.modified_by,
      company: "", // Add logic to fetch company name if necessary
      IS_ACTIVE: data.active,
      status: data.status,
      trip_type: data.features?.map((f:any) => ({value: f.id}))
    },
    images: images,
    files: documents,
    IS_ACTIVE: data.active
  };
};

export const _onSubmitVehicle = (
  data: any,
  selectedFiles: DocumentCompleteType[],
  imageFiles: { docReference: string; file: File }[],
  setImageError: (value: SetStateAction<boolean>) => void,
  onSubmitForm: (data: any) => void
) => {
  try {
    setImageError(false);
    onSubmitForm({ ...data, images: imageFiles, files: selectedFiles });
  } catch (error) {
    console.warn({ error });
  }
};

export const validationButtonText = (statusForm: "create" | "edit" | "review") => {
  switch (statusForm) {
    case "create":
      return "Crear nuevo vehículo";
    case "edit":
      return "Guardar Cambios";
    case "review":
      return "Editar vehículo";
  }
};

export const TitleFormTab = (title: string, level: 1 | 2 | 5 | 3 | 4 | undefined) => {
  return (
    <Title className="title" level={level}>
      {title}
    </Title>
  );
};
