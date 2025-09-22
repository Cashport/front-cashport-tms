import { IForm, Journey, JourneyCreate, JourneyFormValues, typeOfTrip } from "./types";
// dayjs locale
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
dayjs.locale("es");
dayjs.extend(utc);
dayjs.extend(tz);

function getIdOfTripType(tripType: typeOfTrip | null): number | null {
  switch (tripType) {
    case typeOfTrip.CARGA:
      return 1;
    case typeOfTrip.IZAJE:
      return 2;
    case typeOfTrip.PERSONAL:
      return 3;
    default:
      return 1; // Retorna null si el tipo de viaje no es válido
  }
}

function getTypeOfTrip(id: number): typeOfTrip | null {
  switch (id) {
    case 1:
      return typeOfTrip.CARGA;
    case 2:
      return typeOfTrip.IZAJE;
    case 3:
      return typeOfTrip.PERSONAL;
    default:
      return null; // Retorna null si el ID no es válido
  }
}

export const getServiceDescription = (idTypeService: number): string => {
  switch (idTypeService) {
    case 1:
      return "Carga";
    case 2:
      return "Izaje";
    default:
      return "Personal";
  }
};

export const combineDateTimeDayjs = (date: Dayjs | null, time?: Dayjs | null) => {
  const hour = time ? dayjs(time).get("hour") : 0;
  const minute = time ? dayjs(time).get("minute") : 0;
  return date ? date.hour(hour).minute(minute) : dayjs();
};

export const createData = ({ data, idTransferRequest }: IForm): JourneyCreate => {
  return {
    idTransferRequest,
    journey: {
      id: data.id ?? undefined,
      order_to: data.order_to ?? 0,
      id_end_location: data.destination?.id ?? 0,
      id_start_location: data.origin?.id ?? 0,
      end_date: data.endDate?.toISOString() ?? "",
      start_date: data.startDate?.toISOString() ?? "",
      id_type_service: getIdOfTripType(data?.typeActive) ?? 0,
      start_date_flexible: data.startTimeFlexible,
      end_date_flexible: data.endTimeFlexible,
      route: data.route
    }
  };
};

export const createDataSoftSave = (data: JourneyFormValues): Journey => {
  return {
    order_to: data.order_to ?? 0,
    id_end_location: data.destination?.id ?? 0,
    id_start_location: data.origin?.id ?? 0,
    end_date: data.endDate?.toISOString() ?? "",
    start_date: data.startDate?.toISOString() ?? "",
    id_type_service: getIdOfTripType(data.typeActive ?? typeOfTrip.CARGA) ?? 0,
    start_date_flexible: data.startTimeFlexible,
    end_date_flexible: data.endTimeFlexible,
    route: data.route,
    start_location_desc: data.origin?.description ?? "",
    end_location_desc: data.destination?.description ?? "",
    type_service_desc: data.typeActive ?? "",
    community_name: data.community_name,
    is_community: data.is_community
  };
};

export const createFormValues = (selectedTrip: Journey): JourneyFormValues => {
  const typeActive = getTypeOfTrip(selectedTrip.id_type_service);
  const startDateDays = dayjs.utc(selectedTrip?.start_date);
  const endDateDays = dayjs.utc(selectedTrip?.end_date);
  const hoursLifting = endDateDays.diff(startDateDays, "hours");

  return {
    order_to: selectedTrip.order_to,
    id: selectedTrip.id ?? undefined,
    typeActive: typeActive,
    startDate: startDateDays,
    startTime: startDateDays,
    endDate: endDateDays,
    endTime: endDateDays,
    startTimeFlexible: selectedTrip.start_date_flexible,
    endTimeFlexible: selectedTrip.end_date_flexible,
    origin: {
      description: "",
      id: selectedTrip.id_start_location,
      coordinates: null
    },
    destination: {
      description: "",
      id: selectedTrip.id_end_location,
      coordinates: null
    },
    route: selectedTrip.route,
    needLiftingDestination: false,
    needLiftingOrigin: false,
    timeLiftingInOrigin: typeActive === typeOfTrip.IZAJE ? hoursLifting : 0,
    community_name: selectedTrip.community_name,
    is_community: selectedTrip.is_community
  };
};
