import { STATUS } from "./globalConstants";

export const TransferOrdersState = [
  {
    id: "d33e062f-51a5-457e-946e-a45cbbffbf95",
    name: "Sin iniciar",
    bgColor: "#969696"
  },
  {
    id: "0f7cccf5-1764-44c6-bb2a-874f419bc8f1",
    name: "Cargando",
    bgColor: "#0085FF"
  },
  {
    id: "b9e5ce08-16a7-4880-88a5-ebca7737c55d",
    name: "En curso",
    bgColor: "#A9BA43"
  },
  {
    id: "780fa2f9-1b89-4d92-83dc-52de4c932056",
    name: "Descargando",
    bgColor: "#FF6B00"
  },
  {
    id: "9f37afd7-1852-457d-964b-378fa6150471",
    name: "Detenido",
    bgColor: "#ED171F"
  },
  {
    id: "73ad61e3-395f-4ae4-8aef-9d24f3f917a9",
    name: "Stand by",
    bgColor: "#3D3D3D"
  },
  {
    id: STATUS.TO.PROCESANDO,
    name: "Procesando",
    bgColor: "#969696"
  },
  {
    id: STATUS.TO.PROCESADO,
    name: "TO Procesado",
    bgColor: "#A9BA43"
  },
  {
    id: STATUS.TO.CANCELADO,
    name: "TO Cancelada",
    bgColor: "#B94A48"
  },
  {
    id: STATUS.TR.ESPERANDO_PROVEEDOR,
    name: "Esperando proveedor",
    bgColor: "#ED171F"
  },
  {
    id: STATUS.TR.ASIGNANDO_VEHICULO,
    name: "Asignando vehículo",
    bgColor: "#0085FF"
  },
  {
    id: STATUS.TO.SIN_PROCESAR,
    name: "Sin procesar",
    bgColor: "#000000"
  },
  {
    id: STATUS.BNG.POR_LEGALIZAR,
    name: "Por Legalizar",
    bgColor: "#FF6B00"
  },
  {
    id: STATUS.TR.POR_ACEPTAR,
    name: "Por aceptar",
    bgColor: "#969696"
  },
  {
    id: STATUS.TR.CANCELADO,
    name: "TR Cancelada",
    bgColor: "#B94A48"
  },
  {
    id: "40f8e08b-1e7b-4412-ba57-e62e7352b729",
    name: "Aceptadas",
    bgColor: "#0085FF"
  },
  {
    id: "089a3253-94dc-43ed-bff9-3c3c332b4be1",
    name: "Preautorizado",
    bgColor: "#CBE71E"
  },
  {
    id: "b46233c0-0587-4a57-a452-adf5c5a70c11",
    name: "Facturado",
    bgColor: "#FF6B00"
  }
];
