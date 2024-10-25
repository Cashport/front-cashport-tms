export interface IDriverTimeLine {
  id: number;
  description: string;
  date: Date;
  driverName: string;
  evidence: string | null;
  aditionalData: string | null;
}

export interface IDriverMap {
  id: number;
  name: string;
  last_name: string;
  qualification: string;
  url_archive: string | null;
  kmTraveled: string;
  hoursTraveled: string;
  id_trip: number;
  id_route: string;
  id_journey: number;
  id_transfer_request: number;
  id_user: number;
  final_client: string;
  observations: string;
  user: string;
  timeline: IDriverTimeLine[];
}

export interface IDriverMapResponse {
  success: boolean;
  status: number;
  message: string;
  data: IDriverMap;
}