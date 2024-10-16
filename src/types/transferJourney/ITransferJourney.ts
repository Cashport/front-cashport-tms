import { INovelty } from "../novelty/INovelty";

export interface ITripJourney {
  id: number;
  id_journey: number;
  plate_number: string | null;
  provider: string;
  id_provider: number;
  description: string;
  fare: number;
  surcharge: number;
  total: number;
  trip_status: string;
  trip_status_id: string;
  trip_status_color: string;
  novelties: INovelty[];
  id_vehicle_type: number;
  vehicle_type?: string;
  edit_novelties: 0 | 1;
}

export interface ITransferJourney {
  id: number;
  description: string;
  start_date: Date;
  end_date: Date;
  start_location: string;
  end_location: string;
  trips: ITripJourney[];
}
