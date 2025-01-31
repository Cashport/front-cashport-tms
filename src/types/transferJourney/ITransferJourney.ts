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

export interface IRequirement {
  id: number;
  id_journey: number;
  id_requirement: number;
  units: number;
  fare: number;
  total: number;
  id_transfer_request: number;
  id_carrier_request: number;
  id_pricing: number;
  active: 0 | 1;
  description: string;
  id_provider: number;
  provider: string;
  requirement_status: string;
  requirement_status_id: string;
  requirement_status_color: string;
}

export interface IRequirementJourney {
  id: number;
  id_journey: number;
  id_requirement: number;
  units: number;
  fare: number;
  total: number;
  id_transfer_request: number;
  id_carrier_request: number;
  id_pricing: number;
  active: 0 | 1;
  description: string;
  id_provider: number;
  provider: string;
  requirement_status: string;
  requirement_status_id: string;
  requirement_status_color: string;
  journey_id: number;
  journey_description: string;
  journey_start_date: Date;
  journey_end_date: Date;
  journey_start_location: string;
  journey_end_location: string;
}
export interface ITransferJourney {
  id: number;
  description: string;
  start_date: Date;
  end_date: Date;
  start_location: string;
  end_location: string;
  trips: ITripJourney[];
  requirements: IRequirement[];
}
