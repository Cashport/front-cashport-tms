import { FileObject } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";

export interface FileWithLink extends FileObject {
  link?: string;
  name?: string;
}

export interface EvidenceByVehicleForm {
  entityType: "trip" | "requirement";
  entityId: number;
  description: string;
  documents: FileWithLink[];
}

export interface IVehicleAPI {
  id: number;
  carrier_id: number;
  plate_number: string;
  provider: string;
  MT: string[];
}

export interface IParsedFormValues {
  flag: string;
  url?: string;
  file?: undefined;
}
