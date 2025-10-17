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
  id_project: number;
  description: string;
  related_user_id: number;
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