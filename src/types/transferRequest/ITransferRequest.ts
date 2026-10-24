import { ILocation } from "../logistics/schema";

export interface ITransferRequest {
  id: number;
  // numero visible por proyecto: id_to en filas de TO, id_tr en filas de TR
  // (en filas de TO, id_tr es el numero de su TR)
  id_to?: number | null;
  id_tr?: number | null;
  is_materials_problem: boolean;
  is_people_problem: boolean;
  is_rejected: 1 | 0;
  start_location: string;
  end_location: string;
  start_date: Date;
  end_date: Date;
  type: string;
  total_value: number;
  description: string;
  created_at: Date;
  id_transfer_request?: number;
  carriers: string;
  statusId: string;
  transferType: string;
  TOs?: string;
  start_group_location: string | null;
  end_group_location: string | null;
}

export interface ITimeLine {
  id: number;
  description: string;
  end_date: Date;
  start_date: Date;
  location: string;
  service_type_id: number;
}

export interface IStep {
  id: number;
  id_transfer_request: number;
  name: string;
  order_nro: number;
  consolidation_date: Date;
  uuid_user: string;
}

export interface IGeometryResponse {
  weight_name: string;
  weight: number;
  duration: number;
  distance: number;
  legs: [];
  geometry: any;
}

export interface ITransferRequestDetail {
  id: number;
  /** numero visible de la TR en su proyecto */
  id_tr?: number | null;
  status: string;
  status_id: string;
  start_date: Date;
  end_date: Date;
  start_location: ILocation;
  end_location: ILocation;
  total_fare: number;
  total_price: number;
  surcharge: number;
  distance: number;
  time_total: number;
  step: number;
  timeLine: ITimeLine[];
  steps: IStep[];
  geometry: IGeometryResponse;
  transfer_orders: number[];
  /** id interno (enlaces) y numero visible de cada TO */
  transfer_orders_detail?: { id: number; id_to: number | null }[];
  id_end_location: number;
  id_start_location: number;
  fixed_rate: 0 | 1;
}

export interface IPagination {
  actualPage: number;
  totalPages: number;
  rowsperpage: number;
  totalRows: number;
}
export interface ITransferRequestResponse {
  statusId: string; // uuid
  transferType: string;
  items: ITransferRequest[];
  page: IPagination;
  total_value: number;
  total_count: number;
}
