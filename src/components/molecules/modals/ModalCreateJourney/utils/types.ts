import { Dayjs } from "dayjs";

// Enum para el tipo de viaje
export enum typeOfTrip {
  IZAJE = "IZAJE",
  CARGA = "CARGA",
  PERSONAL = "PERSONAL"
}
export enum FormMode {
  "CREATION" = "CREATION",
  "EDITION" = "EDITION",
  "VIEW_ONLY" = "VIEW_ONLY",
  "DELETE" = "DELETE"
}
export interface Location {
  description: string;
  id: number | null;
  coordinates: [number, number] | null;
}

export interface Geometry {
  type: string; // "LineString"
  coordinates: [number, number][]; // Array of [longitude, latitude]
}

export interface Leg {
  // Define this based on the actual structure of each leg, if available
}

export interface RouteForm {
  distance: number;
  duration: number;
  geometry: Geometry;
}
export interface RouteAPI extends RouteForm {
  weight: number;
  weight_name: string;
  legs: Leg[]; // Array of Leg objects, structure should be defined based on actual data
}

export interface JourneyFormValues {
  order_to: number | null;
  typeActive: typeOfTrip | null;
  origin: Location | null;
  destination: Location | null;
  route: RouteAPI[];
  needLiftingOrigin: boolean;
  timeLiftingInOrigin: number;
  needLiftingDestination: boolean;
  startDate: Dayjs | null;
  startTime: Dayjs | null;
  endDate: Dayjs | null;
  endTime: Dayjs | null;
  startTimeFlexible: number;
  endTimeFlexible: number;
  community_name: string;
  is_community: 0 | 1;
  id?: number;
}

export interface Journey {
  community_name: string;
  end_date: string; // ISO date string
  end_date_flexible: number;
  end_location_desc: string;
  id_end_location: number;
  id_start_location: number;
  id_type_service: number;
  is_community: 0 | 1;
  order_to: number;
  route: RouteAPI[];
  start_date: string; // ISO date string
  start_date_flexible: number;
  start_location_desc: string;
  type_service_desc: string;
  id?: number;
  order_tr?: number;
}
export interface IForm {
  idTransferRequest: number;
  data: JourneyFormValues;
}
export interface JourneyCreate {
  idTransferRequest: number;
  journey: Omit<
    Journey,
    | "start_location_desc"
    | "end_location_desc"
    | "is_community"
    | "community_name"
    | "type_service_desc"
  >;
}
export interface Option {
  value: number;
  label: string;
}

export const OPTIONS_FLEXBILE: Option[] = [
  { value: 0, label: "Exacto" },
  { value: 1, label: "+/- 1 día" },
  { value: 2, label: "+/- 2 días" },
  { value: 3, label: "+/- 3 días" }
];
