export interface ITransferRequest {
  id: number;
  is_materials_problem: boolean;
  is_people_problem: boolean;
  start_location: string;
  end_location: string;
  start_date: Date;
  end_date: Date;
  type: string;
  total_value: number;
  description: string;
  created_at: Date;
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
  start_location: string;
  end_location: string;
  total_fare: number;
  surcharge: number;
  distance: number;
  time_total: number;
  step: number;
  timeLine: ITimeLine[];
  steps: IStep[];
  geometry: IGeometryResponse;
}

export interface ITransferRequestResponse {
  statusId: string;
  transferType: string;
  items: ITransferRequest[];
}