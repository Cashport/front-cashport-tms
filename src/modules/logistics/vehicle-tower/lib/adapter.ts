import type {
  IApiHistoryTrip,
  IApiTrip,
  IApiTripDetail,
  IApiUnassignedTr,
  IApiVehicle
} from "../types/vehicleTowerApi";
import type { IVehicleTowerTrip, IVehicleTowerUnassignedTr } from "../types/vehicleTower";

export const trLabel = (id: string): string => `TR-${id}`;

const EMPTY_DOCUMENTS: IVehicleTowerTrip["documents"] = {
  vehicleEarliestExpiration: null,
  driverEarliestExpiration: null,
  vehicle: [],
  driver: []
};

function capacityText({ kgCapacity, passengerCapacity, serviceType }: IApiVehicle): string {
  if (passengerCapacity && (serviceType === "Personal" || !kgCapacity)) {
    return `${passengerCapacity} pasajeros`;
  }
  if (kgCapacity) {
    return `${(kgCapacity / 1000).toLocaleString("es-CO", { maximumFractionDigits: 1 })} t`;
  }
  return "--";
}

export function adaptTrip(a: IApiTrip): IVehicleTowerTrip {
  const { kgCapacity: _kg, passengerCapacity: _pax, ...vehicle } = a.vehicle;
  return {
    ...a,
    transferRequest: a.transferRequest && {
      ...a.transferRequest,
      id: trLabel(a.transferRequest.id),
      observations: ""
    },
    vehicle: { ...vehicle, capacity: capacityText(a.vehicle) },
    driver: a.driver && { ...a.driver, servicesThisYear: "" },
    routeGeometry: [],
    trail: [],
    documents: EMPTY_DOCUMENTS,
    materials: [],
    passengers: [],
    followUps: [],
    appEvents: []
  };
}

export const adaptHistoryTrip = (a: IApiHistoryTrip): IVehicleTowerTrip => ({
  ...adaptTrip(a),
  positions: a.positions,
  followUps: a.followUps,
  appEvents: a.appEvents
});

export const adaptUnassigned = (a: IApiUnassignedTr): IVehicleTowerUnassignedTr => ({
  ...a,
  transferRequest: trLabel(a.transferRequest)
});

export const mergeDetail = (trip: IVehicleTowerTrip, d: IApiTripDetail): IVehicleTowerTrip => ({
  ...trip,
  transferRequest: trip.transferRequest && {
    ...trip.transferRequest,
    observations: d.observations ?? ""
  },
  driver: trip.driver && { ...trip.driver, servicesThisYear: d.servicesThisYear },
  routeGeometry: d.routeGeometry,
  trail: d.trail,
  documents: d.documents,
  materials: d.materials,
  passengers: d.passengers,
  followUps: trip.positions ? trip.followUps : d.followUps,
  appEvents: trip.positions ? trip.appEvents : d.appEvents,
  logEvents: d.logEvents
});
