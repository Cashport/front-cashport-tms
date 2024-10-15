export const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
export const FIREBASE_AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
export const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
export const FIREBASE_STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
export const FIREBASE_MESSAGING_SENDER_ID = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
export const FIREBASE_APP_ID = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
export const FIREBASE_MEASUREMENT_ID = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;
export const STORAGE_TOKEN = "token";

export const COOKIE_NAME = process.env.NEXT_PUBLIC_COOKIE_SESSION_NAME;

// ---
export const CREATED = 201;
export const SUCCESS = 200;

export const STATUS = {
  TO: {
    SIN_PROCESAR: "9f5ba87c-8736-4367-8077-3b914d2ee711",
    PROCESANDO: "00ce0b06-71b8-4981-861f-b4fa100dbd25",
    PROCESADO: "56859d8f-2345-4df2-b811-2371905d80a0"
  },
  CR: {
    POR_CONFIRMAR: "e2210921-8650-44a2-8c3a-b96d9cd492b4",
    EN_REVISÓN: "ae986b0b-071b-479d-a7ee-79160dae7fc9",
    ASIGNADAS: "6f793cd8-6203-4287-8941-b3ee90a55194",
    RECHAZADO: "64869ad8-70c1-4a2c-81c3-4d7f4879cb3a"
  },
  BNG: {
    POR_ACEPTAR: "a9a0e7cd-96e3-4738-806d-225641117a62",
    ACEPTADAS: "40f8e08b-1e7b-4412-ba57-e62e7352b729",
    PREAUTORIZADO: "089a3253-94dc-43ed-bff9-3c3c332b4be1",
    FACTURADO: "b46233c0-0587-4a57-a452-adf5c5a70c11",
    POR_LEGALIZAR: "ce946d35-381e-4bf3-a54a-4d38fb1b5e92",
    LEGALIZADO: "49e6c46e-5a57-4a38-8b13-955bbffb7279"
  },
  TI: {
    PENDIENTE: "dadec8ad-3c5d-40f7-b5b2-42b0ad7cd4d7",
    ACEPTADA: "ab5034d3-dda6-4557-bf8c-e75ce6494097",
    RECHAZADA: "da258586-c04b-4603-bea5-f9bce49687e0"
  },
  TR: {
    ASIGNANDO_VEHICULO: "a48b8b32-8699-4b6f-b56c-277238a656bc",
    ESPERANDO_PROVEEDOR: "a312eb37-9a20-4e46-a010-3ee8d5cb2d94",
    SIN_INICIAR: "d33e062f-51a5-457e-946e-a45cbbffbf95",
    CARGANDO: "0f7cccf5-1764-44c6-bb2a-874f419bc8f1",
    EN_CURSO: "b9e5ce08-16a7-4880-88a5-ebca7737c55d",
    DESCARGANDO: "780fa2f9-1b89-4d92-83dc-52de4c932056",
    DETENIDO: "9f37afd7-1852-457d-964b-378fa6150471",
    STAND_BY: "73ad61e3-395f-4ae4-8aef-9d24f3f917a9",
    POR_LEGALIZAR: "ce946d35-381e-4bf3-a54a-4d38fb1b5e92",
    LEGALIZADO: "49e6c46e-5a57-4a38-8b13-955bbffb7279"
  },
  NOVELTY: {
    PENDIENTE: "5bffe76c-2707-4088-bdff-1ae66701874b",
    ACEPTADA: "81600787-0837-4d61-ae85-730642c52be0",
    RECHAZADA: "2ff3d7bd-73c5-4d62-bce9-6fb163098f8f"
  }
};

export const TMSMODULES = {
  "TMS-Proveedores": "/logistics/providers/all",
  "TMS-Dashboard": "/map",
  "TMS-Viajes": "/logistics/transfer-orders",
  "TMS-AceptacionProveedor": "/logistics/acept_carrier",
  "TMS-Facturacion": "/facturacion",
  "TMS-Configuracion": "/logistics/configuration"
};

export const TMS_COMPONENTS = {
  ["TMS-Viajes"]: {
    REQUESTS: "Solicitudes",
    IN_PROCESS: "En curso",
    COMPLETED: "Facturacion",
    CREATE_TR: "Crear-TR",
    DOWNLOAD_SHEET: "Descargar-Hoja"
  },
  ["TMS-Proveedores"]: {},
  ["TMS-Dashboard"]: {},
  ["TMS-AceptacionProveedor"]: {},
  ["TMS-Facturacion"]: {},
  ["TMS-Configuracion"]: {
    CONFIGURATION: "Configuración",
    MATERIALS: "Materiales",
    USERS: "Usuarios",
    LOCATIONS: "Ubicacion"
  }
};
