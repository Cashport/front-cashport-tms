import { ILocation } from "../logistics/schema";

export interface ITransferRequest {
  id: number;
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
}
