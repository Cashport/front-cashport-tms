import Title from "antd/es/typography/Title";
import { SetStateAction } from "react";

import { IUploadRequirementstTableRow } from "@/components/organisms/logistics/proveedores/ModalUploadRequirements/ModalUploadRequirements";

import { IGetCertificate } from "@/types/logistics/certificate/certificate";
import { IFeature } from "@/types/features/feature";
import {
  IVehicle,
  ICertificates,
  VehicleType,
  IFormGeneralVehicle,
  CustomFile
} from "@/types/logistics/schema";

export type StatusForm = "review" | "create" | "edit";

export interface VehicleFormTabProps {
  idVehicleForm?: string;
  data?: IVehicle;
  disabled?: boolean;
  onEditVehicle?: () => void;
  // eslint-disable-next-line no-unused-vars
  onSubmitForm?: (data: any, imageFiles: CustomFile[]) => void;
  // eslint-disable-next-line no-unused-vars
  handleFormState?: (newFormState: StatusForm) => void;
  onActiveVehicle?: () => void;
  onDesactivateVehicle?: () => void;
  onAuditVehicle?: () => void;
  statusForm: "create" | "edit" | "review";
  params: {
    id: string;
    vehicleId: string;
  };
  documentsTypesList: IGetCertificate[];
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

export const normalizeVehicleData = (data: IVehicle): any => {
  console.log("dataVehicle", data);
  if (!data) return {};

  const documents = data.documents.map((doc) => ({
    file: {
      name: doc.name,
      url: doc.templateUrl
    }
  }));

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
      trip_type: data.features?.map((f: any) => ({ value: f.id })),
      images: data.images
    },
    files: documents,
    IS_ACTIVE: data.active
  };
};

export const _onSubmitVehicle = (
  data: IFormGeneralVehicle,
  uploadedFiles: IUploadRequirementstTableRow[],
  imageFiles: { docReference: string; file: File }[],
  // eslint-disable-next-line no-unused-vars
  setImageError: (value: SetStateAction<boolean>) => void,
  // eslint-disable-next-line no-unused-vars
  onSubmitForm: (data: any, imageFiles: any) => void
) => {
  try {
    setImageError(false);

    const documents = uploadedFiles.map((doc, index) => {
      const document: {
        documentTypeId: number;
        fieldName: string;
        expiryDate?: string;
      } = {
        documentTypeId: doc.requirementType!,
        fieldName: doc.fileName || `documento-${index + 1}`
      };

      if (doc.expirationDate) {
        document.expiryDate = doc.expirationDate;
      }

      return document;
    });

    onSubmitForm({ ...data, documents }, imageFiles);
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
