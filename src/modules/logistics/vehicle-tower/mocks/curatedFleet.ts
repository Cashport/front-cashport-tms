import { STATUS } from "@/utils/constants/globalConstants";
import { CDOCS, earliestExpiration, condDocs, hasTrailer, vehDocs } from "../lib/documents";
import type { DocEntry } from "../lib/documents";
import { nearestFrac, curvy, posAt, routeMetrics, simEvents, stateAt } from "../lib/sim";
import { toTMS } from "../lib/rules";
import { HR, offsetToIso } from "../lib/time";
import type {
  IVehicleTowerDocument,
  IVehicleTowerFollowUp,
  IVehicleTowerMaterial,
  IVehicleTowerPassenger,
  IVehicleTowerTrackingEvent,
  IVehicleTowerTrip,
  TowerSegmentState
} from "../types/vehicleTower";

export type LngLat = [number, number];

export type MockSegment = [TowerSegmentState, number, number, number | string, number | string];

export interface IMockSeed {
  pl: string;
  mun: string;
  tipo: string;
  prov: string;
  cond: string;
  tel: string;
  reg: string;
  an: number;
  tr: string | null;
  ruta: string[];
  sal?: number;
  dur?: number;
  costo?: number;
  paradas?: string[];
  plan?: number[];
  s: MockSegment[];
  fu: number[];
  ping?: number;
  mod?: "Personas" | "Carga" | "Izaje";
  psl?: string;
  sol?: [string, string, string];
  gen?: boolean;
  tmsNow?: string | null;
  jit?: [number, number];
  rf?: boolean;
  cli?: string;
}

export const CITY_COORDS: Record<string, LngLat> = {
  Bogotá: [-74.08, 4.65],
  Villavicencio: [-73.63, 4.14],
  Acacías: [-73.76, 3.99],
  "Castilla La Nueva": [-73.69, 3.83],
  "Puerto Gaitán": [-72.08, 4.31],
  "Campo Rubiales": [-71.95, 3.8],
  Yopal: [-72.39, 5.35],
  Aguazul: [-72.55, 5.17],
  Tauramena: [-72.75, 5.02],
  Neiva: [-75.28, 2.93],
  Barrancabermeja: [-73.85, 7.07],
  "Puerto Boyacá": [-74.59, 5.98],
  Cartagena: [-75.51, 10.39],
  Barranquilla: [-74.8, 10.96],
  Coveñas: [-75.68, 9.4],
  Cúcuta: [-72.5, 7.89],
  Bucaramanga: [-73.12, 7.12],
  Orito: [-76.87, 0.67],
  "Puerto Asís": [-76.5, 0.5],
  Medellín: [-75.57, 6.25],
  Tibú: [-72.73, 8.64],
  Sogamoso: [-72.93, 5.71],
  Girardot: [-74.8, 4.3],
  Honda: [-74.75, 5.2],
  Sincelejo: [-75.4, 9.3],
  "El Carmen": [-75.12, 9.72],
  Aguachica: [-73.62, 8.31],
  Pamplona: [-72.65, 7.38],
  Mocoa: [-76.65, 1.15],
  Cota: [-74.1, 4.81],
  Mosquera: [-74.22, 4.71],
  Aipe: [-75.24, 3.22],
  "Paz de Ariporo": [-71.89, 5.88],
  Villanueva: [-72.93, 4.61],
  Trinidad: [-71.66, 5.41],
  Arauca: [-70.76, 7.08],
  Saravena: [-71.88, 6.95],
  "Sabana de Torres": [-73.5, 7.39],
  "La Dorada": [-74.66, 5.45],
  "Puerto Wilches": [-73.89, 7.35],
  Monterrey: [-72.9, 4.88],
  Granada: [-73.71, 3.55]
};

export const ANALYSTS = [
  { name: "Laura Pinzón", phone: "313 640 1182" },
  { name: "Andrés Molina", phone: "316 702 9945" },
  { name: "Camila Rueda", phone: "320 118 4473" },
  { name: "Julián Ortiz", phone: "311 935 2068" }
];

export const CARRIER_CONTACTS: Record<string, [string, string]> = {
  "Vías del Llano SAS": ["Despacho · Óscar Rincón", "318 640 2271"],
  "Carga Andina Express": ["Despacho · Diana Mejía", "315 882 0914"],
  "Transcosta Logística": ["Despacho · Ricardo Pérez", "300 517 3368"],
  "Tanques del Oriente": ["Despacho · Paola Suárez", "311 274 9052"],
  "Pesados del Sur SAS": ["Despacho · Hernán Ruiz", "320 908 4413"]
};

export const REQUESTERS: Array<[string, string, string]> = [
  ["Carlos Benavides", "Production Enhancement", "310 552 8107"],
  ["Natalia Acosta", "Cementing", "315 204 7731"],
  ["Sergio Villamil", "Completion Tools", "318 663 0942"],
  ["Mónica Prieto", "Baroid", "312 480 5519"],
  ["Juan Pablo Ríos", "Wireline & Perforating", "300 917 2264"]
];

const CLIENTS = [
  "Ecopetrol",
  "Frontera Energy",
  "GeoPark",
  "Parex Resources",
  "Hocol",
  "SierraCol Energy",
  "Halliburton"
];

const BRAND_BY_TYPE: Record<string, string> = {
  Tractocamión: "Kenworth T800 · 2019",
  Carrotanque: "International 7600 · 2018",
  "Cama baja": "Freightliner M2 · 2020",
  Turbo: "Chevrolet NPR · 2021",
  "Camión sencillo": "Hino FC · 2017",
  "CAMIONETA 4X4": "Toyota Hilux · 2022",
  "VAN 9 PASAJEROS": "Renault Master · 2021",
  "C-100": "Chevrolet NHR · 2020",
  "C-350": "Hino Dutro · 2019",
  "C-600": "Chevrolet NPR · 2019",
  "MINIMULA C2S2": "Hino FC · 2018",
  CABEZOTE: "Kenworth T800 · 2018",
  TRACTOMULA: "International ProStar · 2019",
  "TRACTOCAMION 34 TON": "Freightliner Cascadia · 2020",
  CARROTANQUE: "International 7600 · 2017",
  "CAMA BAJA": "Kenworth T800 · 2017",
  "GRÚA 30 TON": "Grove RT · 2016",
  MONTACARGAS: "Hyster H155 · 2018"
};

const SEED_FILES = [
  [{ name: "foto_cargue.jpg", size: 1258291 }],
  [{ name: "remision_despacho.pdf", size: 348160 }],
  [],
  [
    { name: "correo_proveedor.eml", size: 56320 },
    { name: "ubicacion_whatsapp.png", size: 402650 }
  ],
  [],
  [{ name: "manifiesto_carga.pdf", size: 612352 }]
];

const COMMENTS = [
  "Conductor confirma avance normal",
  "Se valida ubicación con el proveedor",
  "Conductor reporta tráfico en la vía",
  "Se confirma hora estimada de llegada con el usuario",
  "Seguimiento telefónico sin novedad"
];
const COMMENTS_BY_STATE = {
  sitio: [
    "Conductor confirma que sigue en sitio a la espera de descargue",
    "Se valida con el proveedor: vehículo en locación",
    "Usuario confirma que el vehículo continúa en sitio",
    "Seguimiento telefónico sin novedad",
    "Se solicita al proveedor actualizar el estado en la app"
  ],
  det: [
    "Proveedor informa que el vehículo sigue en el mismo punto",
    "Conductor reporta novedad mecánica, espera repuesto",
    "Se escala la novedad al proveedor",
    "Seguimiento telefónico: sin cambios"
  ],
  ori: [
    "Conductor confirma que está en el punto de cargue",
    "Se llama al conductor para confirmar hora de salida",
    "Proveedor confirma vehículo asignado",
    "Sin respuesta del conductor; se contacta al proveedor"
  ]
};

function commentFor(st: string, k: number): string {
  const L =
    st === "En ruta"
      ? COMMENTS
      : st === "Detenido"
        ? COMMENTS_BY_STATE.det
        : st === "Sin iniciar" || st === "Cargando" || st === "Programado"
          ? COMMENTS_BY_STATE.ori
          : COMMENTS_BY_STATE.sitio;
  return L[k % L.length];
}

const EV_STATE: Partial<Record<TowerSegmentState, [boolean, string]>> = {
  "En parada": [true, "Llega a parada intermedia (app del conductor)"],
  Cargando: [true, "Inicio de cargue (app del conductor)"],
  "En ruta": [true, "Inicia recorrido (app del conductor)"],
  Descargando: [true, "Inicio de descargue (app del conductor)"],
  "Stand by": [false, "El TMS marca stand by: vehículo en destino sin descargar"],
  Detenido: [false, "El TMS detecta el vehículo detenido en vía"],
  "Sin servicio": [true, "Servicio finalizado"]
};

function tmsNowOf(seed: IMockSeed): string | null | undefined {
  if (!seed.tr) return undefined;
  const seg = seed.s.filter((x) => x[1] <= 0).pop();
  const st = seg
    ? seg[0] === "En ruta" || seg[0] === "En parada"
      ? "En curso"
      : seg[0]
    : "Sin iniciar";
  return st === "Sin servicio" ? null : st;
}

const STATE_ID_BY_TMS: Record<string, string> = {
  "Sin iniciar": STATUS.TRIP.SIN_INICIAR,
  Cargando: STATUS.TRIP.CARGANDO,
  "En curso": STATUS.TRIP.EN_CURSO,
  Descargando: STATUS.TRIP.DESCARGANDO,
  Detenido: STATUS.TRIP.DETENIDO,
  "Stand by": STATUS.TRIP.STAND_BY
};

const RAW_SEEDS: IMockSeed[] = [
  {
    pl: "SXT 482",
    mun: "FUNZA",
    tipo: "Tractocamión",
    prov: "Vías del Llano SAS",
    cond: "Wilson Garzón",
    tel: "310 428 7715",
    reg: "VAO",
    an: 0,
    tr: "TR-40418",
    ruta: ["Bogotá", "Villavicencio", "Puerto Gaitán"],
    sal: -6,
    dur: 8,
    costo: 6850000,
    paradas: ["Bogotá", "Villavicencio", "Puerto Gaitán"],
    plan: [-6, -3.6, 2],
    s: [
      ["Cargando", -7.2, -6, 0, 0],
      ["En ruta", -6, -3.4, 0, "Villavicencio"],
      ["En parada", -3.4, -2.6, "Villavicencio", "Villavicencio"],
      ["En ruta", -2.6, 2, "Villavicencio", 1]
    ],
    fu: [-4.6, -3.3, -2.1, -0.5]
  },
  {
    pl: "TKL 905",
    mun: "BARRANCABERMEJA",
    tipo: "Carrotanque",
    prov: "Tanques del Oriente",
    cond: "Jairo Mendoza",
    tel: "313 905 2240",
    reg: "VRN",
    an: 1,
    tr: "TR-40377",
    ruta: ["Barrancabermeja", "Aguachica", "El Carmen", "Cartagena"],
    sal: -9,
    dur: 14,
    costo: 9420000,
    s: [
      ["En ruta", -9, -2.6, 0, 0.52],
      ["Detenido", -2.6, 1, 0.52, 0.52]
    ],
    fu: [-7.5, -5, -3.4]
  },
  {
    pl: "WPR 311",
    mun: "YOPAL",
    tipo: "Cama baja",
    prov: "Vías del Llano SAS",
    cond: "Édgar Cárdenas",
    tel: "321 660 1408",
    reg: "VAO",
    an: 2,
    tr: "TR-40352",
    ruta: ["Yopal", "Aguazul", "Tauramena"],
    sal: -10,
    dur: 4,
    costo: 4980000,
    s: [
      ["En ruta", -10, -7, 0, 1],
      ["Descargando", -7, -5.6, 1, 1],
      ["Stand by", -5.6, 3, 1, 1]
    ],
    fu: [-9, -7.2, -2.8]
  },
  {
    pl: "SNV 227",
    mun: "NEIVA",
    tipo: "Turbo",
    prov: "Pesados del Sur SAS",
    cond: "Fabio Quintero",
    tel: "316 237 8890",
    reg: "VRC",
    an: 3,
    tr: "TR-40425",
    ruta: ["Neiva", "Girardot", "Bogotá"],
    sal: -4.5,
    dur: 7,
    costo: 3120000,
    s: [
      ["Cargando", -5.6, -4.5, 0, 0],
      ["En ruta", -4.5, 3, 0, 1]
    ],
    fu: [-5.4]
  },
  {
    pl: "GKM 640",
    mun: "MOSQUERA",
    tipo: "Tractocamión",
    prov: "Carga Andina Express",
    cond: "Nelson Ospina",
    tel: "314 552 6037",
    reg: "VRN",
    an: 1,
    tr: "TR-40431",
    ruta: ["Bogotá", "Honda", "Puerto Boyacá", "Barrancabermeja"],
    sal: -2.5,
    dur: 10,
    costo: 7340000,
    s: [
      ["Sin iniciar", -6, -3.1, 0, 0],
      ["Cargando", -3.1, 3, 0, 0]
    ],
    fu: [-5.2, -3.1]
  },
  {
    pl: "TTR 118",
    mun: "VILLAVICENCIO",
    tipo: "Carrotanque",
    prov: "Tanques del Oriente",
    cond: "Ramiro Castañeda",
    tel: "312 718 3305",
    reg: "VRN",
    an: 0,
    tr: "TR-40329",
    ruta: [
      "Puerto Gaitán",
      "Villavicencio",
      "Bogotá",
      "Honda",
      "Puerto Boyacá",
      "Aguachica",
      "Sincelejo",
      "Coveñas"
    ],
    sal: -14,
    dur: 30,
    costo: 14600000,
    s: [
      ["Sin iniciar", -20, -15.6, 0, 0],
      ["Cargando", -15.6, -14, 0, 0],
      ["En ruta", -14, -11.2, 0, 0.12],
      ["Detenido", -11.2, -10.3, 0.12, 0.12],
      ["En ruta", -10.3, -6.4, 0.12, 0.27],
      ["Detenido", -6.4, -5.6, 0.27, 0.27],
      ["En ruta", -5.6, 16, 0.27, 1]
    ],
    fu: [-15.4, -13, -8.5, -4.2],
    ping: -1.7
  },
  {
    pl: "JHU 774",
    mun: "ACACÍAS",
    tipo: "Camión sencillo",
    prov: "Vías del Llano SAS",
    cond: "Óscar Lozano",
    tel: "310 774 9921",
    reg: "VAO",
    an: 2,
    tr: "TR-40437",
    ruta: ["Villavicencio", "Acacías", "Castilla La Nueva"],
    sal: -0.8,
    dur: 2,
    costo: 980000,
    s: [
      ["Cargando", -1.6, -0.8, 0, 0],
      ["En ruta", -0.8, 1.2, 0, 1]
    ],
    fu: [-1.5, -0.8]
  },
  {
    pl: "FDP 209",
    mun: "CÚCUTA",
    tipo: "Tractocamión",
    prov: "Tanques del Oriente",
    cond: "Gustavo Peña",
    tel: "317 209 4486",
    reg: "VRO",
    an: 3,
    tr: "TR-40401",
    ruta: ["Cúcuta", "Tibú"],
    sal: -5,
    dur: 4,
    costo: 2860000,
    s: [["Sin iniciar", -9, 3, 0, 0]],
    fu: [-8.2]
  },
  {
    pl: "LMB 532",
    mun: "ITAGÜÍ",
    tipo: "Cama baja",
    prov: "Carga Andina Express",
    cond: "Hugo Restrepo",
    tel: "315 532 1170",
    reg: "VRC",
    an: 1,
    tr: "TR-40412",
    ruta: ["Medellín", "Puerto Boyacá"],
    sal: -3,
    dur: 6,
    costo: 5720000,
    s: [
      ["Cargando", -4.4, -3, 0, 0],
      ["En ruta", -3, 3, 0, 1]
    ],
    fu: [-4.2, -2.6, -0.9]
  },
  {
    pl: "XKC 408",
    mun: "MOCOA",
    tipo: "Carrotanque",
    prov: "Pesados del Sur SAS",
    cond: "Libardo Chamorro",
    tel: "320 408 6652",
    reg: "VPI",
    an: 2,
    tr: "TR-40419",
    ruta: ["Orito", "Puerto Asís"],
    sal: -5.6,
    dur: 2,
    costo: 1450000,
    s: [
      ["En ruta", -5.6, -3.2, 0, 1],
      ["Descargando", -3.2, 1, 1, 1]
    ],
    fu: [-5.5, -3.2, -1.1]
  },
  {
    pl: "RTA 615",
    mun: "SOLEDAD",
    tipo: "Tractocamión",
    prov: "Transcosta Logística",
    cond: "Alberto Díaz",
    tel: "301 615 2093",
    reg: "VRN",
    an: 3,
    tr: "TR-40428",
    ruta: ["Barranquilla", "Cartagena"],
    sal: -1.8,
    dur: 3,
    costo: 1890000,
    s: [
      ["Cargando", -2.6, -1.8, 0, 0],
      ["En ruta", -1.8, 1.2, 0, 1]
    ],
    fu: [-2.5, -1.5],
    ping: -0.8
  },
  {
    pl: "PQS 340",
    mun: "BOGOTÁ D.C.",
    tipo: "Turbo",
    prov: "Pesados del Sur SAS",
    cond: "Mauricio Guzmán",
    tel: "318 340 7745",
    reg: "VRC",
    an: 0,
    tr: "TR-40439",
    ruta: ["Bogotá", "Girardot", "Neiva"],
    sal: -1,
    dur: 6,
    costo: 2950000,
    s: [
      ["Cargando", -1.9, -1, 0, 0],
      ["En ruta", -1, 5, 0, 1]
    ],
    fu: [-1.8, -0.9]
  },
  {
    pl: "MNO 851",
    mun: "YOPAL",
    tipo: "Tractocamión",
    prov: "Vías del Llano SAS",
    cond: "Rubén Barrera",
    tel: "311 851 0367",
    reg: "VAO",
    an: 2,
    tr: "TR-40441",
    ruta: ["Yopal", "Aguazul"],
    sal: -4.6,
    dur: 2,
    costo: 1120000,
    s: [
      ["Sin iniciar", -8, -5.6, 0, 0],
      ["Cargando", -5.6, 1, 0, 0]
    ],
    fu: [-5.5, -2.2]
  },
  {
    pl: "HBZ 190",
    mun: "VILLAVICENCIO",
    tipo: "Carrotanque",
    prov: "Tanques del Oriente",
    cond: "Diego Ardila",
    tel: "314 190 5528",
    reg: "VAO",
    an: 0,
    tr: "TR-40409",
    ruta: ["Castilla La Nueva", "Villavicencio", "Bogotá"],
    sal: -3.5,
    dur: 5,
    costo: 2310000,
    s: [
      ["En ruta", -3.5, -1.2, 0, 0.62],
      ["Detenido", -1.2, 2, 0.62, 0.62]
    ],
    fu: [-3.4, -2.2, -1.4]
  },
  {
    pl: "VCE 733",
    mun: "PUERTO GAITÁN",
    tipo: "Cama baja",
    prov: "Vías del Llano SAS",
    cond: "Arley Moreno",
    tel: "322 733 1185",
    reg: "VAO",
    an: 2,
    tr: "TR-40415",
    ruta: ["Puerto Gaitán", "Campo Rubiales"],
    sal: -7,
    dur: 5,
    costo: 3860000,
    s: [
      ["En ruta", -7, -4.6, 0, 1],
      ["Descargando", -4.6, 3, 1, 1]
    ],
    fu: [-6.8, -4.5, -1.6]
  },
  {
    pl: "KLR 264",
    mun: "BUCARAMANGA",
    tipo: "Tractocamión",
    prov: "Carga Andina Express",
    cond: "Javier Rojas",
    tel: "316 264 9031",
    reg: "VRO",
    an: 1,
    tr: "TR-40432",
    ruta: ["Bucaramanga", "Barrancabermeja", "Puerto Boyacá"],
    sal: -6.4,
    dur: 9,
    costo: 4240000,
    paradas: ["Bucaramanga", "Barrancabermeja", "Puerto Boyacá"],
    plan: [-6.4, -4.4, 2.6],
    s: [
      ["Cargando", -7.2, -6.4, 0, 0],
      ["En ruta", -6.4, -4.7, 0, "Barrancabermeja"],
      ["En parada", -4.7, 3, "Barrancabermeja", "Barrancabermeja"]
    ],
    fu: [-7, -4.6, -2.2]
  },
  {
    pl: "SFG 902",
    mun: "SOGAMOSO",
    tipo: "Turbo",
    prov: "Vías del Llano SAS",
    cond: "Leonardo Pacheco",
    tel: "313 902 6624",
    reg: "VAO",
    an: 3,
    tr: "TR-40427",
    ruta: ["Sogamoso", "Yopal"],
    sal: -2.2,
    dur: 4,
    costo: 1680000,
    s: [["En ruta", -2.2, 1.8, 0, 1]],
    fu: [-2.1, -0.4]
  },
  {
    pl: "YTM 803",
    mun: "CARTAGENA",
    tipo: "Carrotanque",
    prov: "Transcosta Logística",
    cond: "Elkin Salgado",
    tel: "300 803 4459",
    reg: "VRN",
    an: 1,
    tr: "TR-40442",
    ruta: ["Cartagena", "El Carmen", "Aguachica", "Barrancabermeja"],
    sal: -0.75,
    dur: 14,
    costo: 9100000,
    s: [["Sin iniciar", -3, 3, 0, 0]],
    fu: [-2.6]
  },
  {
    pl: "NAP 120",
    mun: "NEIVA",
    tipo: "Tractocamión",
    prov: "Pesados del Sur SAS",
    cond: "Germán Silva",
    tel: "317 120 3346",
    reg: "VRC",
    an: 3,
    tr: "TR-40388",
    ruta: ["Girardot", "Neiva"],
    sal: -9,
    dur: 4,
    costo: 2720000,
    s: [
      ["En ruta", -9, -5.5, 0, 1],
      ["Stand by", -5.5, 3, 1, 1]
    ],
    fu: [-8.4, -5.4, -1.9]
  },
  {
    pl: "OPL 291",
    mun: "PUERTO ASÍS",
    tipo: "Turbo",
    prov: "Pesados del Sur SAS",
    cond: "Hernando Muñoz",
    tel: "312 291 7708",
    reg: "VPI",
    an: 2,
    tr: "TR-40436",
    ruta: ["Puerto Asís", "Orito"],
    sal: -1.1,
    dur: 2.5,
    costo: 1240000,
    s: [["En ruta", -1.1, 1.4, 0, 1]],
    fu: [-1.1, -0.3]
  },
  {
    pl: "BDE 648",
    mun: "SINCELEJO",
    tipo: "Carrotanque",
    prov: "Transcosta Logística",
    cond: "Fredy Montes",
    tel: "301 648 2257",
    reg: "VRN",
    an: 1,
    tr: "TR-40341",
    ruta: ["Barrancabermeja", "Aguachica", "Sincelejo", "Coveñas"],
    sal: -15,
    dur: 12,
    costo: 8700000,
    s: [
      ["En ruta", -15, -4, 0, 1],
      ["Descargando", -4, -3, 1, 1],
      ["Sin servicio", -3, 5, 1, 1]
    ],
    fu: [-14, -10, -6, -3.5]
  },
  {
    pl: "QWE 377",
    mun: "BOGOTÁ D.C.",
    tipo: "Camión sencillo",
    prov: "Carga Andina Express",
    cond: "Iván Torres",
    tel: "310 377 5512",
    reg: "VRC",
    an: 0,
    tr: null,
    ruta: ["Bogotá"],
    s: [["Sin servicio", -24, 5, 0, 0]],
    fu: []
  },
  {
    pl: "ZXN 516",
    mun: "VILLAVICENCIO",
    tipo: "Tractocamión",
    prov: "Vías del Llano SAS",
    cond: "Camilo Herrera",
    tel: "321 516 0874",
    reg: "VAO",
    an: 2,
    tr: null,
    ruta: ["Villavicencio"],
    s: [["Sin servicio", -24, 5, 0, 0]],
    fu: []
  }
];

export const CURATED_SEEDS: IMockSeed[] = RAW_SEEDS.map((r) => ({ ...r, tmsNow: tmsNowOf(r) }));

const UNASSIGNED_SEEDS = [
  { tr: "TR-40446", ruta: "Bogotá → Yopal", sal: 3 },
  { tr: "TR-40448", ruta: "Neiva → Orito", sal: 7 },
  { tr: "TR-40450", ruta: "Cúcuta → Tibú", sal: 16 },
  { tr: "TR-40451", ruta: "Cartagena → Coveñas", sal: 21 }
];

export interface IMockUnassignedTr {
  transferRequest: string;
  route: string;
  departureAt: string;
  psl: string;
}

// TODO(decisión): la HU no incluye en GET /api/vehicle-tower las TRs sin vehículo (pie del panel, "se gestionan
// en Riesgo de retraso en la salida"); aquí salen aparte del mock, con la PSL que el prototipo les asigna.
export const buildMockUnassignedTrs = (now: Date): IMockUnassignedTr[] =>
  UNASSIGNED_SEEDS.map((x, i) => ({
    transferRequest: x.tr,
    route: x.ruta,
    departureAt: offsetToIso(now, x.sal),
    psl: REQUESTERS[(i * 2) % REQUESTERS.length][1]
  }));

const CATALOGO: Array<[string, string, [string, number, number]]> = [
  ["HAL-102341", "Arena de fractura 20/40", ["sacos", 40, 1]],
  ["HAL-208774", "Cemento clase G", ["sacos", 50, 0.05]],
  ["HAL-311902", "Bomba triplex HT-400", ["und", 1, 9.5]],
  ["HAL-402115", 'Tubería de producción 3½"', ["tubos", 60, 0.14]],
  ["HAL-517330", "Cloruro de potasio (KCl)", ["sacos", 80, 0.025]],
  ["HAL-622018", "Empaque de producción", ["und", 4, 0.3]],
  ["HAL-730561", "Válvula de seguridad SSSV", ["und", 2, 0.18]],
  ["HAL-845220", "Bentonita", ["sacos", 60, 0.05]],
  ["HAL-950447", "Herramienta de cañoneo", ["und", 3, 0.6]],
  ["HAL-118093", "Inhibidor de corrosión", ["canecas", 12, 0.21]]
];

function materialsOf(id: number): IVehicleTowerMaterial[] {
  const n = 1 + ((id * 3) % 8);
  return Array.from({ length: n }, (_, i) => {
    const c = CATALOGO[(id * 7 + i * 3) % CATALOGO.length];
    const quantity = Math.max(1, Math.round(c[2][1] * (0.6 + ((id + i) % 5) / 5)));
    return {
      code: c[0],
      description: c[1],
      quantity,
      unit: c[2][0],
      weightTons: quantity * c[2][2]
    };
  });
}

const PAX: Array<[string, string]> = [
  ["Andrés Galvis", "Ingeniero de campo"],
  ["Diana Cárdenas", "Supervisora HSE"],
  ["Luis Fernando Mora", "Operador de equipo"],
  ["Kevin Rojas", "Ayudante de operaciones"],
  ["Paula Herrera", "Ingeniera de completamiento"],
  ["Jhon Salazar", "Operador de equipo"],
  ["Marcela Vega", "Técnica de laboratorio"]
];
const PAX_PSLS = [
  "Production Enhancement",
  "Cementing",
  "Completion Tools",
  "Wireline & Perforating",
  "Baroid",
  "Sperry Drilling"
];

function passengersOf(id: number): IVehicleTowerPassenger[] {
  const n = 2 + (id % 5);
  return Array.from({ length: n }, (_, k) => {
    const p = PAX[(id + k * 2) % PAX.length];
    const phone = String(3100000000 + ((id * 7919 + k * 104729) % 89999999)).replace(
      /(\d{3})(\d{3})(\d{4})/,
      "$1 $2 $3"
    );
    return { name: p[0], psl: PAX_PSLS[(id + k) % PAX_PSLS.length], phone };
  });
}

interface IObsContext {
  veh: string;
  mod: string;
  o: string;
  d: string;
  to: number;
  psl: string;
}
const OBS: Array<(o: IObsContext) => string> = [
  (o) =>
    `Se requiere ${o.veh.toLowerCase()} para ${o.mod === "Personas" ? "traslado de personal" : "transporte de materiales"} desde ${o.o} hasta ${o.d}. Presentarse 30 minutos antes de la hora de salida en portería principal. El conductor debe contar con EPP completo (casco, botas y gafas) y curso de manejo defensivo vigente.`,
  (o) =>
    `TO ${o.to}: Servicio para ${o.psl}. Recoger en base ${o.o} y entregar en locación del cliente en ${o.d}. Coordinar ingreso con supervisor de pozo antes de llegar; la locación exige inducción HSE de 20 minutos. No se permite ingreso después de las 6:00 p. m. Contacto en sitio con el company man del turno. Llevar copia física del manifiesto y de la remisión firmada.`,
  (o) =>
    `Viaje redondo ${o.o} – ${o.d} – ${o.o}. El vehículo debe quedar disponible durante la operación (aprox. 8 horas) y regresar el mismo día.`,
  (o) =>
    `Carga sobredimensionada: requiere escolta y permiso de tránsito vigente. Validar altura máxima en el paso por ${o.d}. Amarre con cadenas y verificación de carga cada 2 horas. Reportar novedades de vía al analista de turno por WhatsApp. En caso de lluvia fuerte, esperar en zona segura y avisar. Entregar al almacenista de la locación con firma y sello en la remisión; tomar foto de la entrega y cargarla en la app.`,
  () =>
    "Material frágil, manipular con cuidado. Entregar en almacén del cliente en horario de 7:00 a. m. a 4:00 p. m."
];

const capacityOf = (type: string): string => {
  const t = type.toLowerCase();
  if (/camioneta/.test(t)) return "4 pasajeros";
  if (/van/.test(t)) return "9 pasajeros";
  if (/c-100/.test(t)) return "1 t";
  if (/c-350/.test(t)) return "3,5 t";
  if (/c-600|turbo/.test(t)) return "6 t";
  if (/minimula/.test(t)) return "17 t";
  if (/grúa|montacargas/.test(t)) return "30 t";
  return "34 t";
};

const DOC_ISSUER: Record<string, string> = {
  SOAT: "Seguros del Estado",
  Tecnomecánica: "CDA Autos del Llano",
  "Póliza RCE": "Sura",
  "Licencia C3": "Ministerio de Transporte · RUNT",
  "Mercancías peligrosas": "SENA",
  "Seguridad social": "Planilla PILA"
};
const DOC_TERM_DAYS: Record<string, number> = {
  "Licencia C3": 3 * 365,
  "Seguridad social": 30,
  "Mercancías peligrosas": 2 * 365
};

function documentsOf(
  list: DocEntry[],
  id: number,
  carrier: string,
  nowMs: number
): IVehicleTowerDocument[] {
  return list.map(([name, h]) => ({
    name,
    expiresAt: new Date(nowMs + h * HR).toISOString(),
    issuedAt: new Date(nowMs + (h - (DOC_TERM_DAYS[name] || 365) * 24) * HR).toISOString(),
    number: String(1000000 + id * 48311 + name.length * 977).slice(0, 7),
    issuer: DOC_ISSUER[name] ?? (CDOCS.includes(name) ? "Centro de formación certificado" : carrier)
  }));
}

export function seedToTrip(
  seed: IMockSeed,
  index: number,
  now: Date,
  contacts: Record<string, [string, string]>
): IVehicleTowerTrip {
  const i = index;
  const nowMs = now.getTime();
  const iso = (h: number) => offsetToIso(nowMs, h);
  const hasTr = !!seed.tr;
  const waypoints = seed.ruta.map((c) => CITY_COORDS[c]);
  const path = waypoints.length > 1 ? curvy(waypoints) : [waypoints[0]];
  const metrics = routeMetrics(path);
  const fracOf = (c: string) => nearestFrac(path, metrics, CITY_COORDS[c]);
  const sal = seed.sal ?? 0;
  const stopNames = seed.paradas ?? (hasTr ? [seed.ruta[0], seed.ruta[seed.ruta.length - 1]] : []);
  const plan = seed.plan ?? (hasTr ? [sal, sal + (seed.dur ?? 0)] : []);
  const rf =
    hasTr &&
    (seed.rf ?? (seed.gen ? (seed.mod === "Personas" ? i % 3 !== 0 : i % 7 === 2) : false));
  const requester = hasTr ? (seed.sol ?? REQUESTERS[i % REQUESTERS.length]) : null;
  const analyst = ANALYSTS[seed.an];
  const [dispatch, dispatchPhone] = contacts[seed.prov];
  const [model, year] = (BRAND_BY_TYPE[seed.tipo] ?? "Chevrolet NHR · 2020").split(" · ");
  const [brand, ...line] = model.split(" ");
  const [firstName, ...lastName] = seed.cond.split(" ");
  const serviceType = seed.mod
    ? { Personas: "Personal", Carga: "Carga", Izaje: "Izaje" }[seed.mod]
    : seed.tipo === "Cama baja"
      ? "Izaje"
      : i === 16
        ? "Personal"
        : "Carga";
  const docSeed = { id: i, vehicleType: seed.tipo };
  const trNumber = seed.tr ? parseInt(seed.tr.slice(3)) : NaN;
  const vehicleDocs = vehDocs(docSeed);
  const driverDocs = condDocs(docSeed);
  const obsNumber = trNumber || i;
  const stopFirst = stopNames[0];
  const stopLast = stopNames[stopNames.length - 1];

  const trip: IVehicleTowerTrip = {
    tripId: 118000 + i * 137 + (hasTr ? trNumber % 97 : 0),
    stateId: null,
    transferRequest: hasTr
      ? {
          id: seed.tr as string,
          startDate: iso(sal),
          fixedRate: rf,
          observations: OBS[(i + obsNumber) % OBS.length]({
            veh: seed.tipo,
            mod: seed.mod ?? (serviceType === "Personal" ? "Personas" : "Carga"),
            o: stopFirst,
            d: stopLast,
            to: 40000 + (obsNumber % 900),
            psl: requester ? requester[1] : "la PSL"
          })
        }
      : null,
    stops: stopNames.map((name, k) => ({
      name,
      lat: CITY_COORDS[name][1],
      lng: CITY_COORDS[name][0],
      plannedAt: iso(plan[k]),
      precisionRadioM: null
    })),
    routeGeometry: path,
    carrier: {
      name: seed.prov,
      contactName: dispatch.replace(/^Despacho · /, ""),
      phoneNumber: dispatchPhone
    },
    vehicle: {
      plate: seed.pl,
      type: seed.tipo,
      serviceType: serviceType as "Carga" | "Izaje" | "Personal",
      brand,
      line: line.join(" "),
      year: Number(year),
      municipality: seed.mun,
      trailerPlate: hasTrailer(seed.tipo) ? `R${String(30000 + i * 1379).slice(0, 5)}` : null,
      capacity: capacityOf(seed.tipo),
      gpsProvider: ["Satrack", "Detektor", "Cellvi"][i % 3]
    },
    driver: {
      name: firstName,
      lastName: lastName.join(" "),
      phone: seed.tel,
      licenseCategory: "C3",
      servicesThisYear: (14 + i * 5) % 90
    },
    requester: requester ? { name: requester[0], phone: requester[2] } : null,
    analyst: { name: analyst.name, phone: analyst.phone },
    psl: requester ? requester[1] : null,
    client: hasTr ? (seed.cli ?? CLIENTS[(i * 5) % CLIENTS.length]) : null,
    vp: seed.reg,
    cost: hasTr ? { amount: seed.costo ?? 0, pendingApproval: 0 } : null,
    documents: {
      vehicleEarliestExpiration: new Date(earliestExpiration(vehicleDocs, nowMs)).toISOString(),
      driverEarliestExpiration: new Date(earliestExpiration(driverDocs, nowMs)).toISOString(),
      vehicle: documentsOf(vehicleDocs, i, seed.prov, nowMs),
      driver: documentsOf(driverDocs, i, seed.prov, nowMs)
    },
    materials: hasTr && serviceType !== "Personal" ? materialsOf(i) : [],
    passengers: hasTr && serviceType === "Personal" ? passengersOf(i) : [],
    segments: seed.s.map((x) => ({
      state: x[0],
      from: iso(x[1]),
      to: iso(x[2]),
      progressFrom: typeof x[3] === "string" ? fracOf(x[3]) : x[3],
      progressTo: typeof x[4] === "string" ? fracOf(x[4]) : x[4]
    })),
    lastPing: { lat: 0, lng: 0, date: iso(seed.ping ?? 99) },
    lastFollowUp: null,
    followUps: [],
    appEvents: []
  };

  const [lng, lat] = posAt(trip, nowMs);
  trip.lastPing.lat = lat;
  trip.lastPing.lng = lng;

  const tms = toTMS(stateAt(trip, nowMs));
  trip.stateId = STATE_ID_BY_TMS[tms] ?? null;

  const appEvents: IVehicleTowerTrackingEvent[] = [];
  seed.s.forEach(([st, from]) => {
    const ev = EV_STATE[st];
    if (from > -24 && ev)
      appEvents.push({ eventTime: iso(from), eventType: ev[1], fromApp: ev[0] });
  });
  trip.appEvents = appEvents;

  const segState = (h: number) => {
    let x = seed.s[0][0];
    for (const q of seed.s) if (h >= q[1]) x = q[0];
    return x;
  };
  trip.followUps = seed.fu.map((h, j): IVehicleTowerFollowUp => {
    const files = SEED_FILES[(i + j) % SEED_FILES.length];
    return {
      id: `seed-${trip.tripId}-${j}`,
      createdAt: iso(h),
      outcome: null,
      contacted: true,
      reportedStatus: toTMS(stateAt(trip, Math.round(nowMs + h * 3600e3))),
      description: commentFor(segState(h), i + j),
      createdBy: analyst.name,
      files: files.map((f) => ({ name: f.name, sizeBytes: f.size }))
    };
  });
  const past = trip.followUps.filter((f) => new Date(f.createdAt).getTime() <= nowMs);
  trip.lastFollowUp = past.length
    ? past.reduce((a, b) => (new Date(b.createdAt) > new Date(a.createdAt) ? b : a))
    : null;

  if (hasTr) {
    const { events, pendingApproval } = simEvents(trip, i, nowMs);
    trip.logEvents = events;
    if (trip.cost) trip.cost.pendingApproval = pendingApproval;
  }
  return trip;
}
