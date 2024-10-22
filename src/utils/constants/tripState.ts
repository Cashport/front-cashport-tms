import { STATUS } from "./globalConstants";

export const TripState = [
  {
    id: STATUS.TRIP.CARGANDO,
    bgColor: '#0085FF',
    textColor: '#FFFFFF',
    urlMap: 'https://cashport-tms.s3.us-east-2.amazonaws.com/Icono+Gris.png',
  },
  {
    id: STATUS.TRIP.EN_CURSO,
    bgColor: '#CBE71E',
    textColor: '#141414',
    urlMap: 'https://cashport-tms.s3.us-east-2.amazonaws.com/Icono+Verde.png',
  },
  {
    id: STATUS.TRIP.DESCARGANDO,
    bgColor: '#FE7A01',
    textColor: '#FFFFFF',
    urlMap: 'https://cashport-tms.s3.us-east-2.amazonaws.com/Icono+Naranja.png',
  },
  {
    id: STATUS.TRIP.DETENIDO,
    bgColor: '#C80000',
    textColor: '#FFFFFF',
    urlMap: 'https://cashport-tms.s3.us-east-2.amazonaws.com/Icono+Rojo.png',
  },
  {
    id: STATUS.TRIP.STAND_BY,
    bgColor: '#F2CB05',
    textColor: '#141414',
    urlMap: 'https://cashport-tms.s3.us-east-2.amazonaws.com/Icono+Rojo.png',
  },
];
