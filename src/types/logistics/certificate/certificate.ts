import { Key } from "react";

export interface CertificateType {
  key?: Key | null;
  id: number;
  entity_type: number;
  description: string;
  optional: boolean;
  id_location: any;
  id_material_type: any;
  expiry: any;
  template: any;
  active: Active | boolean;
  created_at: string;
  created_by: string;
  modified_at: any;
  modified_by?: any;
}

export interface Active {
  type: string;
  data: number[];
}

export type DocumentCompleteType = CertificateType & { file: File | undefined } & {
  expirationDate: any;
} & { link?: string } & { entity_type_desc?: string };

export interface IGetCertificate {
  key?: Key | null;
  id: number;
  name: string;
  description: string;
  documentType: string;
  documentTypeId: number;
  isAvailable: boolean; // originalmente 1 o 0 → boolean
  isMandatory: boolean; // originalmente 1 o 0 → boolean
  statusColor: string;
  statusId: string;
  statusName: string;
  createdAt: string;
  templateUrl: string | null;
  subjectSubtypeId: number;
  subjectTypeId: string;
  validity: {
    expiry: boolean;
  };
}

export interface ICertificateAndDocuments extends IGetCertificate {
  file: File | undefined;
  expirationDate: any;
  link?: string;
  entity_type_desc?: string;
}
