import { Config, WelcomeHeaders } from "../schema";

export interface SendCarrierRequest {
  carrierRequest: CarrierRequest[];
}

export interface CarrierRequest {
  id_transfer_request: number;
  id_carrier: number;
  id_vehicle_type: number;
  fare: number;
  id_trip: number;
  id_pricing: number;
}

export interface DriverDocument {
  id_document_type: number;
  description: string;
  entity_type: number;
  optional: boolean;
}

export interface VehicleDocument {
  id_document_type: number;
  description: string;
  entity_type: number;
  optional: boolean;
}

export interface Material {
  id: number;
  description: string;
  id_type_material: number;
  kg_weight: number;
  mt_height: number;
  mt_width: number;
  mt_length: number;
  m3_volume: number;
  rotation: boolean;
  can_stack: boolean;
  image: string;
  aditional_info: string;
  active: boolean;
  created_at: string;
  created_by: string;
  modified_at: string | null;
  modified_by: string | null;
  icon: string;
  restriction: boolean;
  code_sku: string | null;
}

export interface CarrierRequestMaterialByTrip {
  id: number;
  id_transfer_request: number;
  id_transfer_order: number | null;
  id_trip: number;
  id_material: number;
  units: number;
  created_at: string;
  created_by: string;
  modified_at: string | null;
  modified_by: string | null;
  material: Material[];
}

export interface CarrierRequestContact {
  id: number;
  id_transfer_order: number;
  id_contact: number;
  contact_type: number;
  name: string;
  contact_number: number;
  id_psl: number | null;
  id_cost_center: number | null;
  active: number;
  created_at: string;
  created_by: string;
  modified_at: string;
  modified_by: string;
  id_transfer_request: number;
}

interface Geometry {
  weight_name: string;
  weight: number;
  duration: number;
  distance: number;
  legs: any[];
  geometry: {
    coordinates: number[][];
    type: string;
  };
}
export interface OtherReq {
  id_requirement: number;
  description: string;
  units: number;
  fare: number;
  totalServiceValue: number;
  fee_description: string;
  serviceTime: string;
}

export interface IAceptCarrierAPI {
  id: number;
  id_carrier: number;
  service_type: string;
  start_date: string;
  end_date: string;
  id_start_location: number;
  start_location: string;
  id_end_location: number;
  end_location: string;
  status: string;
  created_at: string;
  created_by: string;
  statusdesc: string;
  color: string;
  vehicles: string;
  elapsedtime: string;
  amount: number;
  id_transfer_request: number;
  id_vehicle: number;
  id_journey: number;
  id_trip: number;
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  driver_documents: DriverDocument[];
  vehicle_documents: VehicleDocument[];
  carrier_request_material_by_trip: CarrierRequestMaterialByTrip[];
  drivers: any[]; // Asumiendo que es un array vacío o podría ser un array de algún tipo de objeto
  vehicle: any | null; // Asumiendo que puede ser un objeto o `null`
  carrier_request_contacts: CarrierRequestContact[];
  carrier_request_documents: any[]; // Asumiendo que es un array vacío o podría ser un array de algún tipo de objeto
  geometry: Geometry[];
  carrier_request_persons: any[]; // Asumiendo que es un array vacío o podría ser un array de algún tipo de objeto
  observation?: string;
  special_instructions?: string;
  id_service_type: number;
  fee_description?: string;
  declared_cargo_value?: number;
  entity: "otherRequirement" | "trip";
  other_requirement?: OtherReq;
}

export interface Data {
  status: number;
  message: string;
  data: any;
}
export interface IAPIResponse {
  id: any;
  data: Data;
  status: number;
  statusText: string;
  headers: WelcomeHeaders;
  config: Config;
  request: Request;
}

export interface DataCarga extends Material {
  quantity: number;
}

export interface CarrierRequestAPI {
  status: string; // ID único para el estado del servicio
  id: number; // ID del servicio
  service_type: string; // Tipo de servicio (ej. "Carga")
  start_date: string; // Fecha y hora de inicio (formato: DD/MM/YYYY HH:mm)
  end_date: string; // Fecha y hora de fin (formato: DD/MM/YYYY HH:mm)
  start_location: string; // Ubicación inicial
  end_location: string; // Ubicación final
  vehicles: string; // Identificación de los vehículos utilizados
  elapsedtime: string; // Fecha y hora en formato ISO 8601
  amount: number; // Monto asociado al servicio
  order_nro: number; // Número de orden
  id_transfer_request: number; // ID de la solicitud de transferencia
}

export interface CarrierCollapseAPI {
  color: string;
  description: string;
  statusid: string;
  carrierrequests: CarrierRequestAPI[];
}
