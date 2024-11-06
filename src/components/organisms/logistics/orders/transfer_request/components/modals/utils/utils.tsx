import { CarrierRequest, SendCarrierRequest } from "@/types/logistics/carrier/carrier";
import { MockedTrip } from "@/types/logistics/trips/TripsSchema";
import { CraneTower } from "@phosphor-icons/react";
import { Truck, User } from "phosphor-react";

export const getServiceType = (id_type_service: number) => {
  switch (id_type_service) {
    case 1:
      return { title: "Carga", icon: <Truck size={27} color="#FFFFFF" weight="fill" /> };
    case 2:
      return { title: "Izaje", icon: <CraneTower size={27} color="#FFFFFF" weight="fill" /> };
    case 3:
      return { title: "Personal", icon: <User size={27} color="#FFFFFF" weight="fill" /> };
    default:
      return { title: "Desconocido", icon: null }; // Valor por defecto
  }
};

export const convertToSendCarrierRequest = (
  tripsLists: MockedTrip[],
  id_transfer_request: number
): SendCarrierRequest => {
  const carrierRequest: CarrierRequest[] = [];

  tripsLists.forEach((t) => {
    const { trip, type } = t;

    trip.carriers_pricing.forEach((pricing) => {
      if (pricing.checked) {
        if (type === "trip") {
          carrierRequest.push({
            id_transfer_request,
            id_carrier: pricing.id_carrier,
            id_vehicle_type: pricing.id_vehicle_type,
            fare: pricing.price || 0,
            id_trip: trip.id,
            id_pricing: pricing.id_carrier_pricing
          });
        } else {
          carrierRequest.push({
            id_transfer_request,
            id_carrier: pricing.id_carrier,
            fare: pricing.price || 0,
            id_requirement: trip.id,
            id_pricing: pricing.id_carrier_pricing
          });
        }
      }
    });
  });

  return { carrierRequest };
};
