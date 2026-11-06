import { HR } from "./time";

export type DocStatus = "expired" | "expiring" | "valid";

export const EXPIRING_DAYS = 30;

export interface IDocSeed {
  id: number;
  vehicleType: string;
}

export type DocEntry = [string, number];

export const VDOCS = [
  "SOAT",
  "Tecnomecánica",
  "Póliza RCE",
  "Póliza RCC",
  "Póliza de hidrocarburos",
  "Tarjeta de propiedad",
  "Tarjeta de operación",
  "Habilitación de la empresa",
  "Certificado GPS",
  "Certificado de hermeticidad",
  "Certificado de calibración",
  "Inspección preoperacional",
  "Kit de carretera",
  "Certificado de limpieza de tanque",
  "Revisión de quinta rueda"
];

export const CDOCS = [
  "Licencia C3",
  "Seguridad social (PILA)",
  "Afiliación ARL",
  "Mercancías peligrosas",
  "Manejo defensivo",
  "Primeros auxilios",
  "Control de incendios",
  "Curso H2S",
  "Inducción HSE Halliburton",
  "Examen ocupacional",
  "Contrato laboral",
  "Certificado de alturas",
  "Curso de trabajo seguro",
  "Prueba de conocimiento vial"
];

export const hasTrailer = (vehicleType: string): boolean =>
  /tractocami|cama baja|carrotanque|tractomula|cabezote/i.test(vehicleType);

export function docs(seed: IDocSeed): { soat: number; rtm: number; lic: number } {
  const DAY = 24;
  const o = {
    soat: (((seed.id * 53) % 300) + 25) * DAY,
    rtm: (((seed.id * 31) % 250) + 40) * DAY,
    lic: (((seed.id * 71) % 600) + 60) * DAY
  };
  if (seed.id === 5) o.soat = 12 * DAY;
  if (seed.id === 7) o.rtm = -3 * DAY;
  if (seed.id === 13) o.lic = 20 * DAY;
  return o;
}

export function mkDocs(seed: IDocSeed, list: string[], fixed: Record<string, number>): DocEntry[] {
  const v = seed;
  return list.map((n, i) => {
    let h = ((((v.id + 3) * (i + 7) * 37) % 540) + 35) * 24;
    if (fixed[n] !== undefined) h = fixed[n];
    if (i === (v.id * 5 + 3) % list.length && v.id % 3 === 0) h = ((v.id % 4) + 3) * 24;
    if (i === (v.id * 7 + 5) % list.length && v.id % 4 === 1) h = -((v.id % 6) + 2) * 24;
    return [n, h];
  });
}

export function vehDocs(seed: IDocSeed): DocEntry[] {
  const d = docs(seed);
  let L = VDOCS;
  if (!/carrotanque/i.test(seed.vehicleType))
    L = L.filter((n) => !/hermeticidad|limpieza de tanque/.test(n));
  if (!hasTrailer(seed.vehicleType)) L = L.filter((n) => !/quinta rueda/.test(n));
  return mkDocs(seed, L, { SOAT: d.soat, Tecnomecánica: d.rtm });
}

export function condDocs(seed: IDocSeed): DocEntry[] {
  const d = docs(seed);
  return mkDocs(seed, CDOCS, { "Licencia C3": d.lic });
}

export function docStatus(hoursToExpiry: number): DocStatus {
  const d = Math.floor(hoursToExpiry / 24);
  return d < 0 ? "expired" : d <= EXPIRING_DAYS ? "expiring" : "valid";
}

export interface IDocSummary {
  status: DocStatus;
  worstDays: number;
  label: string;
}

export function docSum(hoursList: number[]): IDocSummary {
  const worst = hoursList.reduce((m, h) => Math.min(m, Math.floor(h / 24)), 1e9);
  if (worst < 0) return { status: "expired", worstDays: worst, label: "Documento vencido" };
  if (worst <= EXPIRING_DAYS)
    return { status: "expiring", worstDays: worst, label: `Vence en ${worst} d` };
  return { status: "valid", worstDays: worst, label: "Documentos al día" };
}

export const earliestExpiration = (list: DocEntry[], now: number): number =>
  now + Math.min(...list.map((x) => x[1])) * HR;

export const docSumAt = (earliestExpirationMs: number, now: number): IDocSummary =>
  docSum([(earliestExpirationMs - now) / HR]);
