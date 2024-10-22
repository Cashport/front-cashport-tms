import { JourneyFormValues } from "./types";
// dayjs locale
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
dayjs.locale("es");
dayjs.extend(utc);
dayjs.extend(tz);

export const defaultJourneyValues: JourneyFormValues = {
  id: undefined,
  order_to: null, // Valor por defecto para 'order_to'
  typeActive: null, // Ningún tipo de viaje seleccionado inicialmente
  origin: {
    description: "", // Descripción vacía por defecto
    id: null, // ID nulo por defecto
    coordinates: null // Coordenadas nulas por defecto
  },
  destination: {
    description: "", // Descripción vacía por defecto
    id: null, // ID nulo por defecto
    coordinates: null // Coordenadas nulas por defecto
  },
  route: [], // Valor por defecto para 'route'
  needLiftingOrigin: false, // No se necesita izaje en origen por defecto
  timeLiftingInOrigin: 0, // Tiempo de izaje por defecto es 0
  needLiftingDestination: false, // No se necesita izaje en destino por defecto
  startDate: dayjs.utc(),
  startTime: dayjs.utc(),
  endDate: null,
  endTime: null,
  startTimeFlexible: 0, // Por defecto, la hora de inicio no es flexible
  endTimeFlexible: 0, // Por defecto, la hora de fin no es flexible,
  community_name: "",
  is_community: 0
};
