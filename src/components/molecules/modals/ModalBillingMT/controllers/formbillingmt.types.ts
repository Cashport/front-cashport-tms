import { FileObject } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";

export interface FileWithLink extends FileObject {
  link?: string;
  name?: string;
}

export interface EvidenceByVehicleForm {
  plate: string;
  idTrip: number;
  documents: FileWithLink[];
}
// Empty structure based on the provided interfaces
export const emptyForm: EvidenceByVehicleForm = {
  plate: "",
  idTrip: 0,
  documents: [
    {
      docReference: "",
      file: undefined, // No file uploaded yet
      name: ""
    }
  ]
};

export interface IVehicleAPI {
  id: number;
  carrier_id: number;
  plate_number: string;
  provider: string;
  MT: string[];
}

export const emptyVehicle = {
  id: 0,
  carrier_id: 0,
  plate_number: "",
  provider: "",
  MT: []
};

export interface IParsedFormValues {
  flag: string;
  url?: string;
  file?: undefined;
}
