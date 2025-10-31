export interface ITaskStatus {
  id: string;
  name: string;
  color: string;
  backgroundColor: string;
}

export interface ITaskTypes {
  ID: number;
  NAME: string;
}

export interface ITask {
  id: number;
  pricing_approval_id: number;
  id_project: number;
  description: string;
  related_user_id: number;
  related_user_name: string;
  amount: number | null;
  task_type_name: string;
  transfer_request_id: number;
  carrier_request_id: number;
  start_location_name: string;
  end_location_name: string;
  transfer_order_ids: string;
  start_date: string;
  end_date: string;
  carriers: string[];
  status: ITaskStatus;
}

export interface ITaskApprover {
  id_user: number;
  name: string;
  email: string;
  status: string;
}

export interface ITaskPricingComparation {
  id_carrier_request: number;
  pricing_id: number;
  provider: string;
  vendor: number;
  contract: string;
  vehicle_type: string;
  rate_description: string | null;
  rate: number;
  usage_quantity: number;
  total: number;
}

export interface ITaskPricing {
  id_approval_item: number;
  id_carrier_request: number;
  provider: string;
  vendor: number;
  contract: string;
  vehicle_type: string;
  rate_description: string | null;
  rate: number;
  usage_quantity: number;
  total: number;
  url_evidence: string;
  comparations: ITaskPricingComparation[];
  url_evidence?: string;
}

export interface ITaskApproval {
  id: number;
  id_approval_type: number;
  approval_type_name: string;
  observations: string | null;
  status: string;
  created_by: string;
  created_at: string;
  evidence_file_url?: string;
  evidence_file_name?: string;
  send_single_source: number;
  is_another_contract_active: number;
  is_provider_recommended_by_sustainability: number;
  tercerization_motive?: string | null;
  exists_another_provider_in_zone: number;
  subcontractor_ensure: number;
  origin: string;
  destination: string;
  vp: string;
  id_transfer_request: number;
}

export interface ITaskDetail {
  approval: ITaskApproval;
  pricing: ITaskPricing[];
  users_approval: ITaskApprover[];
}

export interface ITaskApprovalResponse {
  data: "APPROVED" | "REJECTED";
  status: number;
  message: string;
}
