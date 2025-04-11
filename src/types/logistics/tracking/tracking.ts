export interface TrackingEvent {
  id: number;
  event_time: string;
  event_description: string;
  url_photo?: string | null;
  created_at: string;
  created_by: string;
  aditional_data?: string | null;
  responsible?: string | null;
  estimatedValue?: number | null;
  distanceKm?: number | null;
  hours?: number | null;
  rate?: number | null;
  driver?: string | number | null;
  comment?: string | null;
  provider_comment?: string | null;
}

export interface VehicleTracking {
  id: number;
  state_id: string;
  trip_status: string;
  plate_number: string;
  id_vehicle: number;
  vehicle_type: string;
  provider: string;
  id_provider: number;
  driver_id: number;
  driver_name: string;
  driver_phone?: string;
  fee_description?: string;
  trip_tracking: TrackingEvent[];
}

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

export interface IChangeStatusTrip {
  tripStatus: string;
  tripId: number;
  comment: string;
}
