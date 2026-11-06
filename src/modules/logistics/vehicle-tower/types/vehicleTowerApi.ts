import type {
  IVehicleTowerCarrier,
  IVehicleTowerCost,
  IVehicleTowerDocumentsSummary,
  IVehicleTowerFollowUp,
  IVehicleTowerLogEvent,
  IVehicleTowerMaterial,
  IVehicleTowerPassenger,
  IVehicleTowerPing,
  IVehicleTowerSegment,
  IVehicleTowerStop,
  IVehicleTowerTrackingEvent
} from "./vehicleTower";

export interface IApiTransferRequest {
  id: string;
  internalId: number;
  startDate: string;
  fixedRate: boolean;
}

export interface IApiVehicle {
  plate: string;
  type: string;
  serviceType: "Carga" | "Izaje" | "Personal";
  brand: string;
  line: string | null;
  year: number | null;
  municipality: string | null;
  trailerPlate: string | null;
  kgCapacity: number | null;
  passengerCapacity: number | null;
  gpsProvider: string;
}

export interface IApiDriver {
  name: string;
  lastName: string;
  phone: string | null;
  licenseCategory: string | null;
  licenseExpiration: string | null;
}

export interface IApiContact {
  name: string;
  phone: string | null;
}

export interface IApiTrip {
  tripId: number;
  vehicleId: number;
  stateId: string | null;
  transferRequest: IApiTransferRequest | null;
  stops: IVehicleTowerStop[];
  carrier: IVehicleTowerCarrier;
  vehicle: IApiVehicle;
  driver: IApiDriver | null;
  requester: IApiContact | null;
  analyst: IApiContact | null;
  psl: string | null;
  client: string | null;
  vp: string | null;
  cost: IVehicleTowerCost | null;
  segments: IVehicleTowerSegment[];
  lastPing: IVehicleTowerPing | null;
  recentPings: IVehicleTowerPing[];
  lastFollowUp: IVehicleTowerFollowUp | null;
  lastAppEventAt: string | null;
  lastNoveltyAt: string | null;
}

export interface IApiUnassignedTr {
  transferRequest: string;
  route: string;
  departureAt: string;
  psl: string | null;
}

export interface IApiFleet {
  params: { sbHoras: number };
  trips: IApiTrip[];
  trsSinVehiculo?: IApiUnassignedTr[];
}

export interface IApiTripDetail {
  tripId: number;
  routeGeometry: Array<[number, number]>;
  trail: IVehicleTowerPing[];
  observations: string | null;
  servicesThisYear: number | string;
  documents: IVehicleTowerDocumentsSummary;
  materials: IVehicleTowerMaterial[];
  passengers: IVehicleTowerPassenger[];
  followUps: IVehicleTowerFollowUp[];
  appEvents: IVehicleTowerTrackingEvent[];
  logEvents: IVehicleTowerLogEvent[];
}

/** [ms, lng, lat] */
export type ApiPosition = [number, number, number];

export interface IApiHistoryTrip extends IApiTrip {
  positions: ApiPosition[];
  followUps: IVehicleTowerFollowUp[];
  appEvents: IVehicleTowerTrackingEvent[];
}

export interface IApiHistory {
  from: string;
  to: string;
  trips: IApiHistoryTrip[];
}
