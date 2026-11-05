import type { MapStatusTone } from "@/theme/mapPalette";

/** Estados de un segmento. Son los del prototipo: "En ruta" y "En parada" son estados de pantalla (TMS "En curso" + GPS). */
// TODO(decisión): la HU define "En ruta"/"En parada" por GPS (radio de la parada), pero el prototipo
// los trae ya resueltos en los segmentos. Falta definir quién los resuelve en el backend (preguntas abiertas 1 y 2).
export type TowerSegmentState =
  | "Sin iniciar"
  | "Cargando"
  | "En ruta"
  | "En parada"
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
}

/** Fuente: carrier_request elegida -> carriers. */
export interface IVehicleTowerCarrier {
  name: string;
  contactName: string;
  phoneNumber: string;
}

/** Fuente: carrier_request.id_vehicle -> vehicles + vehicle_type + service_type. */
export interface IVehicleTowerVehicle {
  plate: string;
  type: string;
  serviceType: "Carga" | "Izaje" | "Personal";
  brand: string;
  line: string;
  year: number;
  // TODO(decisión): el prototipo muestra la matrícula (p. ej. "FUNZA") en las filas sin servicio y en la ficha
  // del vehículo; la HU no dice de qué columna sale.
  municipality: string;
  trailerPlate: string | null;
  // TODO(decisión): el prototipo deriva la capacidad del tipo de vehículo ("4 pasajeros", "34 t"); la HU no dice de qué columna sale.
  capacity: string;
  // TODO(decisión): proveedor de GPS ("Satrack", "Detektor", "Cellvi"); la HU no lo trae. La periodicidad ("reporte cada 5 min") es un texto fijo del prototipo.
  gpsProvider: string;
  // Nunca se envían gps_user ni gps_password (GAP-052/068).
}

/** Fuente: carrier_request_drivers -> drivers. */
export interface IVehicleTowerDriver {
  name: string;
  lastName: string;
  phone: string;
  // TODO(decisión): categoría de licencia ("C3"); el prototipo la muestra fija, la HU no la trae.
  licenseCategory: string;
  // TODO(decisión): "Servicios con Halliburton" en el año; el prototipo lo simula, la HU no define la fuente.
  servicesThisYear: number;
}

/** Fuente: profit_2.user. */
export interface IVehicleTowerContact {
  name: string;
  // TODO(decisión): pregunta abierta 9, el teléfono puede venir de profit_2.user o de user_mail_uuid.phone.
  phone: string;
}

/** Fuente: trip.fare + novelty aprobadas; pendientes en pendingApproval. */
export interface IVehicleTowerCost {
  amount: number;
  pendingApproval: number;
}

export interface IVehicleTowerTransferRequest {
  // TODO(decisión): la HU usa transfer_request.id (numérico); el prototipo muestra el código "TR-40418".
  id: string;
  startDate: string;
  /** transfer_request.fixed_rate (pregunta abierta 3) */
  fixedRate: boolean;
  // TODO(decisión): el prototipo simula el texto; la HU no define la columna (¿transfer_request.observations?).
  observations: string;
}

/** Fuente: certificates (vista view_vehicles_documents / view_drivers_documents). */
export interface IVehicleTowerDocument {
  name: string;
  expiresAt: string;
  // TODO(decisión): fecha de inicio, número y entidad emisora; el prototipo los simula en el detalle del documento.
  issuedAt: string;
  number: string;
  issuer: string;
}

export interface IVehicleTowerDocumentsSummary {
  /** Menor certificates.expiration_date entre los documentos del vehículo */
  vehicleEarliestExpiration: string;
  /** Menor certificates.expiration_date entre los documentos del conductor */
  driverEarliestExpiration: string;
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
  phone: string;
}

export interface IVehicleTowerSegment {
  state: TowerSegmentState;
  from: string;
  to: string;
  // TODO(decisión): avance sobre la ruta (0..1) al inicio y fin del segmento. Es insumo del simulador del
  // prototipo (posición en el histórico); en producción la posición sale de Mongo `locations` / GET history.
  progressFrom: number;
  progressTo: number;
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
  // TODO(decisión): pregunta abierta 2, qué evento de tracking_type corresponde a cada estado.
  eventType: string;
  /** App del conductor (trip_tracking.created_by = drivers.email, GAP-073). false: evento del TMS. */
  fromApp: boolean;
}

// TODO(decisión): la HU entrega la bitácora completa en GET /api/vehicle-tower/:tripId. Se incluye aquí
// (opcional) porque el prototipo la deriva con simEvents y la ficha la necesita.
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
  /** trip.state_id (FK a status, ver STATUS.TRIP en globalConstants). Null si el servicio ya terminó o no hay TR. */
  stateId: string | null;
  /** TODO(decisión): el prototipo incluye 2 vehículos sin TR ("Sin servicio"); la HU §1 dice que solo entran trips. null = sin TR. */
  transferRequest: IVehicleTowerTransferRequest | null;
  /** Paradas ordenadas por order_tr. Vacío si no hay TR. */
  stops: IVehicleTowerStop[];
  /** Geometría de la ruta planeada [lng, lat] (frequent_routes.json_route, §4.1) */
  routeGeometry: Array<[number, number]>;
  carrier: IVehicleTowerCarrier;
  vehicle: IVehicleTowerVehicle;
  driver: IVehicleTowerDriver;
  /** Usuario de la TO más antigua de la TR */
  requester: IVehicleTowerContact | null;
  analyst: IVehicleTowerContact;
  /** transfer_request_cost_center (mayor porcentaje) -> cost_center -> psl */
  psl: string | null;
  /** transfer_order.id_client -> clients */
  client: string | null;
  // TODO(decisión): la HU saca la VP de cada punto (location.zone_id -> zone.name); el prototipo la trae por vehículo ("Regional").
  vp: string;
  cost: IVehicleTowerCost | null;
  documents: IVehicleTowerDocumentsSummary;
  // TODO(decisión): la HU no define de dónde salen los materiales ni los pasajeros; vienen vacíos si no hay TR
  // (materiales en servicios de personal, pasajeros en los demás).
  materials: IVehicleTowerMaterial[];
  passengers: IVehicleTowerPassenger[];
  segments: IVehicleTowerSegment[];
  lastPing: IVehicleTowerPing;
  lastFollowUp: IVehicleTowerFollowUp | null;
  // TODO(decisión): la HU entrega solo el último seguimiento; el simulador del histórico necesita todos
  // los anteriores al instante consultado (viene de GET history o de la ficha).
  followUps: IVehicleTowerFollowUp[];
  appEvents: IVehicleTowerTrackingEvent[];
  logEvents?: IVehicleTowerLogEvent[];
}

export interface IVehicleTowerResponse {
  // TODO(decisión): la HU acepta ?at= pero no define el campo de corte en la respuesta.
  at: string;
  trips: IVehicleTowerTrip[];
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
