import { INovelty } from "@/types/novelty/INovelty";

export interface TripsCreation {
  id_journey: number;
  id_transfer_request: number;
  trips: TripCreation[];
  other_requirements: Omit<IRequirement, "description">[];
}
export interface TripCreation {
  id: number;
  id_vehicle_type: number;
  materialByTrip: MaterialByTrip[];
  personByTrip: { id_person_transfer_request: number }[];
}
export interface MaterialByTrip {
  id_material: number;
  units: number;
}

export interface JourneyTripPricing {
  id_journey: number;
  start_date: string;
  end_date: string;
  start_location_desc: string;
  end_location_desc: string;
  id_type_service: number;
  trips: TripCarriersPricing[];
  other_requirements: RequirementCarriersPricing[];
  community_name?: string;
  is_community?: 0 | 1;
}

export interface TripCarriersPricing {
  id_trip: number;
  vehicle_type: number;
  vehicle_type_desc: string;
  carriers_pricing: CarriersPricing[];
}

export interface RequirementCarriersPricing {
  id: number;
  idRequirement: number;
  descripcion: string;
  units: number;
  carriers_pricing: CarriersPricing[];
}

export interface CarriersPricing {
  id_carrier_pricing: number;
  valid_from: string;
  valid_to: string;
  description: string;
  disponibility: number;
  price?: number;
  id_vehicle_type: number;
  id_carrier: number;
  nit: string;
  fee_description: string;
  pricing_description?: string;
}

export interface CarriersPricingModal extends CarriersPricing {
  checked?: boolean;
}

export interface Trip {
  id_trip: number;
  vehicle_type: number;
  vehicle_type_desc: string;
  carriers_pricing: CarriersPricingModal[];
}
export interface Requirement {
  id: number;
  idRequirement: number;
  descripcion: string;
  carriers_pricing: CarriersPricingModal[];
}
export type serviceType = "trip" | "other_requirement";
export interface Service {
  id: number;
  service_id: number;
  service_description: string;
  carriers_pricing: CarriersPricingModal[];
  units: number | null;
  type: serviceType;
}

export interface Journey {
  id_journey: number;
  start_date: string;
  end_date: string;
  start_location_desc: string;
  end_location_desc: string;
  id_type_service: number;
  community_name?: string;
  is_community: 0 | 1;
}

export interface ServiceTab {
  service: Service;
  journey: Omit<JourneyTripPricing, "trips" | "other_requirements">;
}

export interface RequirementsAPI {
  id: number;
  description: string;
}

export interface IRequirement {
  idRequirement: number;
  units: number;
  description: string;
}

// Socket trips
export interface ITime {
  id: string;
  stateId: string;
  time: string;
}

export interface IState {
  id: string;
  name: string;
}

export interface IVehicle {
  id: string;
  plateNumber: string;
  behicleType: string;
  number: number;
}

export interface IDocuments {
  name: string;
  url: string;
}

export interface IContact {
  name: string;
  phone: string;
}

export interface IGeometry {
  weight_name: string;
  weight: number;
  duration: number;
  distance: number;
  legs: [];
  geometry: {
    coordinates: number[][];
  };
}

export interface IGeometryResponse {
  _id: string;
  geometry: IGeometry[];
}

export interface ISocketTrip {
  id: string;
  tripId: number;
  transferRequestId: number;
  observations: string;
  stateId: string;
  imgUrl: any;
  name: string;
  tag: string;
  address: string;
  initRoute: Date;
  endRoute: Date;
  startAddress: string;
  endAddress: string;
  volume: string;
  widthVolume: number;
  heightVolume: number;
  lengthVolume: number;
  totalMaterials: number;
  distance: string;
  city: string;
  vehicleTypeId: string;
  createdAt: Date;
  time: ITime[];
  state: IState;
  vehicle: IVehicle;
  documents: IDocuments[];
  initialContact: IContact;
  finalContact: IContact;
  novelties: INovelty[];
  geometry: IGeometryResponse;
}
