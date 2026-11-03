/** Respuesta de GET /control-tower (Torre de control TMS). Fechas en hora de Colombia, 'YYYY-MM-DD HH:mm:ss'. */
export interface IControlTowerApi {
  corte: string;
  tipos: { id: number; nombre: string }[];
  /** id de usuario de Cashport → nombre */
  usuarios: Record<string, string>;
  servicios: IControlTowerTrip[];
  operacion: IControlTowerOpenTr[];
  sinProcesar: IControlTowerUnprocessed[];
  /** id interno de la TR en Por legalizar → fecha de finalización */
  finalizadas: Record<string, string>;
  contratos: IControlTowerContract[];
  proveedoresKpi: { prov: string; resp: number | null; aTiempo: number | null }[];
  /** número visible de la TR → bitácora de seguimiento */
  comentarios: Record<string, IControlTowerComment[]>;
  standby: { horasLibres: number; tarifaHora: Record<string, number> };
}

export interface IControlTowerTrip {
  id: number;
  tr: number;
  trn: number;
  f: string;
  u: number | null;
  psl: string | null;
  vp: string | null;
  ty: number | null;
  veh: string | null;
  prov: string | null;
  md: "contrato" | "subasta" | "tercerizacion";
  orig: string | null;
  dest: string | null;
  km: number | string;
  base: number | string;
  sob: number | string;
  stb: number | string;
  sobNo: number | string;
  drv: string | null;
  plate: string | null;
  st: string;
  appEv: number;
  inicio: string | null;
}

export interface IControlTowerOpenTr {
  tr: number;
  id: number;
  st: "esp" | "asig" | "apl" | "sin" | "carg" | "ruta" | "desc" | "stb" | "det";
  ty: number | null;
  analista: string | null;
  salida: string | null;
  llegada: string | null;
  creada: string | null;
  orig: string | null;
  dest: string | null;
  vp: string | null;
  u: number | null;
  psl: string | null;
  veh: string | null;
  md: "contrato" | "subasta" | "tercerizacion";
  km: number;
  valor: number;
  prov: string | null;
  drv: string | null;
  plate: string | null;
  app: boolean;
  ultSeg: string | null;
  iniStb: string | null;
  iniDet: string | null;
  motivoDet: string | null;
  invitacion: string | null;
}

export interface IControlTowerUnprocessed {
  id: number;
  u: number | null;
  ty: number | null;
  creada: string;
  salida: string | null;
  orig: string | null;
  dest: string | null;
  vp: string | null;
  psl: string | null;
}

export interface IControlTowerContract {
  id: number;
  proveedor: string;
  contrato: string | null;
  total: number | string;
  usado: number | string;
  inicio: string | null;
  fin: string | null;
  horasStandby: number | null;
}

export interface IControlTowerComment {
  who: string;
  role: string;
  txt: string;
  at: string;
  att?: { n: string; k: string; u?: string }[];
}
