import { FileObject } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";

export interface FileWithLink extends FileObject {
  link?: string;
}
export interface IVehicle {
  plate: string;
  documents: FileWithLink[];
  tripId: number;
}
export interface IRequirement {
  requirementId: number;
  description: string;
  documents: FileWithLink[];
}
export interface ICarrier {
  carrier: string;
  idCarrier: number;
  vehicles: IVehicle[];
  requirements: IRequirement[];
  adittionalComment: string;
}
export interface FinalizeTripForm {
  carriers: ICarrier[];
}

// Empty structure based on the provided interfaces
export const emptyForm: FinalizeTripForm = {
  carriers: [
    {
      carrier: "",
      idCarrier: 0, // Assuming 0 is used as a placeholder for no ID
      vehicles: [
        {
          tripId: 0,
          plate: "",
          documents: [
            {
              docReference: "",
              file: undefined, // No file uploaded yet
              aditionalData: undefined // Empty object for additional data
            }
          ]
        }
      ],
      requirements: [
        {
          requirementId: 0,
          description: "",
          documents: [
            {
              docReference: "",
              file: undefined, // No file uploaded yet
              aditionalData: undefined // Empty object for additional data
            }
          ]
        }
      ],
      adittionalComment: ""
    }
  ]
};
