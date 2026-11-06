import type { MapStatusTone } from "@/theme/mapPalette";

/** "En ruta" es el estado En curso del TMS. El estado siempre viene del back: no se deriva del GPS. */
export type TowerSegmentState =
  | "Sin iniciar"
  | "Cargando"
  | "En ruta"
  | "Descargando"
  | "Stand by"
  | "Detenido"
  | "Sin servicio";

/** Fuente: transfer_request_journey + location. */
export interface IVehicleTowerStop {
  name: string;
  lat: number;
  lng: number;
  plannedAt: string;
  /** location.precision_radio (m). Null: se usa PARAM.radioOrigenM. */
  precisionRadioM: number | null;
  arrivedAt: string | null;
  departedAt: string | null;
}

/** Fuente: carrier_request elegida -> carriers. */
export interface IVehicleTowerCarrier {
  name: string;
  contactName: string;
  phoneNumber: string | null;
}

/** Fuente: carrier_request.id_vehicle -> vehicles + vehicle_type + service_type. */
export interface IVehicleTowerVehicle {
  plate: string;
  type: string;
  serviceType: "Carga" | "Izaje" | "Personal";
  brand: string;
  line: string | null;
  year: number | null;
  municipality: string | null;
  trailerPlate: string | null;
  capacity: string;
  gpsProvider: string;
  // Nunca se envían gps_user ni gps_password (GAP-052/068).
}

/** Fuente: carrier_request_drivers -> drivers. */
export interface IVehicleTowerDriver {
  name: string;
  lastName: string;
  phone: string | null;
  licenseCategory: string | null;
  licenseExpiration: string | null;
  servicesThisYear: number | string;
}

/** Fuente: profit_2.user. */
export interface IVehicleTowerContact {
  name: string;
  phone: string | null;
}

/** Fuente: trip.fare + novelty aprobadas; pendientes en pendingApproval. */
export interface IVehicleTowerCost {
  amount: number;
  pendingApproval: number;
}

export interface IVehicleTowerTransferRequest {
  id: string;
  internalId: number;
  startDate: string;
  /** transfer_request.fixed_rate (pregunta abierta 3) */
  fixedRate: boolean;
  observations: string;
}

/** Fuente: certificates (vista view_vehicles_documents / view_drivers_documents). */
export interface IVehicleTowerDocument {
  name: string;
  expiresAt: string;
  issuedAt: string | null;
  number: string;
  issuer: string;
}

export interface IVehicleTowerDocumentsSummary {
  /** Menor certificates.expiration_date entre los documentos del vehículo */
  vehicleEarliestExpiration: string | null;
  /** Menor certificates.expiration_date entre los documentos del conductor */
  driverEarliestExpiration: string | null;
  vehicle: IVehicleTowerDocument[];
  driver: IVehicleTowerDocument[];
}

export interface IVehicleTowerMaterial {
  code: string;
  description: string;
  quantity: number;
  unit: string;
  weightTons: number;
}

export interface IVehicleTowerPassenger {
  name: string;
  psl: string;
  phone: string | null;
}

export interface IVehicleTowerSegment {
  state: TowerSegmentState;
  from: string;
  to: string | null;
}

/** Último ping GPS. Fuente: Mongo `locations` (decisión del responsable, no trip_position). La velocidad es simulada. */
export interface IVehicleTowerPing {
  lat: number;
  lng: number;
  date: string;
}

/** Fuente: trip_follow_up + trip_follow_up_file (tabla nueva). */
export interface IVehicleTowerFollowUp {
  id: string;
  createdAt: string;
  outcome: string | null;
  /** true si fue una gestión contestada: cuenta para la alerta "Sin seguimiento" (OUTCOMES del prototipo) */
  contacted: boolean;
  /** trip_follow_up.reported_status (informativo, no cambia el estado de la TR) */
  reportedStatus: string | null;
  description: string;
  createdBy: string;
  files: IVehicleTowerFollowUpFile[];
}

export interface IVehicleTowerFollowUpFile {
  name: string;
  sizeBytes: number;
  /** Solo en memoria (Fase 1): object URL del archivo adjuntado en esta sesión. Los del mock no lo tienen. */
  url?: string;
}

/** Fuente: trip_tracking. */
export interface IVehicleTowerTrackingEvent {
  eventTime: string;
  eventType: string;
  /** App del conductor (trip_tracking.created_by = drivers.email, GAP-073). false: evento del TMS. */
  fromApp: boolean;
}

export interface IVehicleTowerLogEvent {
  at: string;
  kind: "assignment" | "resourceChange" | "cost";
  tag?: string;
  text: string;
  who: string;
  role: string;
  amount?: number;
  approved?: boolean;
}

export interface IVehicleTowerTrip {
  tripId: number;
  vehicleId: number;
  /** trip.state_id (FK a status, ver STATUS.TRIP en globalConstants). Null si el servicio ya terminó o no hay TR. */
  stateId: string | null;
  /** Null en los vehículos sin trip, que llevan tripId = -vehicleId. */
  transferRequest: IVehicleTowerTransferRequest | null;
  /** Paradas ordenadas por order_tr. Vacío si no hay TR. */
  stops: IVehicleTowerStop[];
  /** Geometría de la ruta planeada [lng, lat] (frequent_routes.json_route, §4.1) */
  routeGeometry: Array<[number, number]>;
  carrier: IVehicleTowerCarrier;
  vehicle: IVehicleTowerVehicle;
  driver: IVehicleTowerDriver | null;
  /** Usuario de la TO más antigua de la TR */
  requester: IVehicleTowerContact | null;
  analyst: IVehicleTowerContact | null;
  /** transfer_request_cost_center (mayor porcentaje) -> cost_center -> psl */
  psl: string | null;
  /** transfer_order.id_client -> clients */
  client: string | null;
  vp: string | null;
  cost: IVehicleTowerCost | null;
  documents: IVehicleTowerDocumentsSummary;
  materials: IVehicleTowerMaterial[];
  passengers: IVehicleTowerPassenger[];
  segments: IVehicleTowerSegment[];
  lastPing: IVehicleTowerPing | null;
  recentPings: IVehicleTowerPing[];
  /** Estela de la ficha */
  trail: IVehicleTowerPing[];
  /** Solo en histórico: [ms, lng, lat] ordenadas por tiempo */
  positions?: Array<[number, number, number]>;
  lastFollowUp: IVehicleTowerFollowUp | null;
  lastAppEventAt: string | null;
  lastNoveltyAt: string | null;
  followUps: IVehicleTowerFollowUp[];
  appEvents: IVehicleTowerTrackingEvent[];
  logEvents?: IVehicleTowerLogEvent[];
}

export interface IVehicleTowerUnassignedTr {
  transferRequest: string;
  route: string;
  departureAt: string;
  psl: string | null;
}

/** PARAM del prototipo; en el futuro viene de vehicle_tower_param. */
export interface IVehicleTowerParams {
  radioOrigenM: number;
  radioDetenidoM: number;
  detenidoMin: number;
  salidaVencidaMin: number;
  sinSenalMin: number;
  riesgoSBh: number;
  segCorto: number;
  segLargo: number;
  sbHoras: number;
  cierreH: number;
}

export type AlertCode = "SB" | "RSB" | "APP" | "DET" | "GPS" | "DEM" | "SEG" | "CIE";

export type AlertLevel = Extract<MapStatusTone, "crit" | "high" | "med" | "off">;

export interface IAlertDefinition {
  lvl: AlertLevel;
  /** Prioridad: cuál manda cuando hay varias activas */
  pri: number;
  name: string;
  fase: string;
  rule: string;
}

export interface IAlertCondition extends IAlertDefinition {
  code: AlertCode;
  since: number;
  short: string;
  detail: string;
}

/** Estado en pantalla. "Asignado" solo es interno de stateAt. */
export type TowerScreenState = TowerSegmentState | "Asignado" | "Programado";

export type FleetBucket = "ok" | "alert" | "off" | "idle";

export interface IEvaluation {
  state: TowerScreenState;
  bucket: FleetBucket;
  level: MapStatusTone;
  /** Programado (sin iniciar antes de salidaVencidaMin) */
  isScheduled?: boolean;
  conditions: IAlertCondition[];
  top: IAlertCondition | null;
}

export interface IFleetItem {
  trip: IVehicleTowerTrip;
  evaluation: IEvaluation;
}

export interface IFollowUpInput {
  outcome: string;
  reportedStatus: string;
  description: string;
  files: IVehicleTowerFollowUpFile[];
}

export interface IFollowUpEntry extends IVehicleTowerFollowUp {
  tripId: number;
}
