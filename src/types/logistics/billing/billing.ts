import { Pagination } from "@/types/global/IGlobal";
import { IIncident, IJourney } from "../schema";

export enum BillingStatusEnum {
  PorAceptar = "Por aceptar",
  Aceptadas = "Aceptadas",
  Preautorizado = "Preautorizado",
  Facturado = "Facturado",
  RechazadoProveedor = "Rechazado proveedor",
  PendienteSoportes = "Pendiente soportes"
}

export interface IBillingsRequestList {
  statusId: string;
  statusDesc: string;
  statusColor: string;
  billings: IBillingRequestsListDetail[];
  page: Pagination;
}

export interface IBillingRequestsListDetail {
  id: number;
  idTransferRequest: number;
  idCarrier: number;
  carrier: string;
  startLocation: string;
  endLocation: string;
  startDate: string;
  endDate: string;
  serviceTypes: string;
  fare: number;
  statusDesc: BillingStatusEnum;
  id_status: string;
  status_color: string;
}

export interface IBillingDetails {
  billing: IBillingRequestsListDetail;
  journeys: IJourney[];
  incidents: IIncident[];
}
export interface BillingByCarrier {
  key: React.Key;
  id: number;
  idTransferRequest: number;
  idCarrier: number;
  carrier: string;
  startLocation: string;
  endLocation: string;
  startDate: string;
  endDate: string;
  fare: number;
  statusDesc: BillingStatusEnum;
  idStatus: string;
  statusColor: string;
  vehicle_quantity: number;
  subtotal: number;
  overcost: number;
  rejectObservation?: string;
}

export interface IBillingRequestDetail extends IBillingRequestsListDetail {
  statusDesc: BillingStatusEnum; // Sobrescribe 'status_desc'
  idStatus: string; // Sobrescribe 'id_status'
  statusColor: string; // Sobrescribe 'status_color'
}

export interface PreAuthorizationRequestData {
  id: number;
  idAuthorization: string;
  authorizationFare: number;
  dateAuthorization: string; // Considera usar `Date` si conviertes el string a objeto Date
  link: string;
  createdAt: string; // Considera usar `Date` si conviertes el string a objeto Date
  createdBy: string;
  idInvoice?: string;
  invoiceDate: string;
  invoiceFare?: number;
  invoiceUrl?: string;
  XMLUrl?: string;
}

export interface IPreauthorizedRequest {
  authorizations: PreAuthorizationRequestData[];
  billing: IBillingRequestDetail;
}
