export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  responsible?: string;
  driver?: string;
  estimatedValue?: number;
  distanceKm?: number;
  rate?: number;
  hours?: number;
  status?: "Abierta" | "Cerrada";
  downloadUrl?: string;
}
export interface VehicleTracking {
  provider: string;
  vehicle: string;
  driver: { name: string; phone: string };
  plate: string;
  status: string;
  trackingEvents: TimelineEvent[];
}
