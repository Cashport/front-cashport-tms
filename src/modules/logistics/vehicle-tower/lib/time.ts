import dayjs from "dayjs";
import { formatMoney } from "@/utils/utils";

export const HR = 3600e3;
export const MIN = 60e3;

/** Hora fija del prototipo (02/11/2026 13:20, hora local). Solo sirve de ancla para comparar con él. */
export const PROTOTYPE_NOW = new Date(2026, 10, 2, 13, 20);

/** Convierte horas relativas al NOW del prototipo en una fecha relativa a `now`. */
export const offsetToDate = (now: Date | number, hours: number): Date =>
  new Date(Math.round(new Date(now).getTime() + hours * HR));

export const offsetToIso = (now: Date | number, hours: number): string =>
  offsetToDate(now, hours).toISOString();

export const toMs = (iso: string): number => new Date(iso).getTime();

export const dt = (ms: number): string => dayjs(ms).format("DD/MM/YYYY HH:mm");

export const hhmm = (ms: number): string => dayjs(ms).format("HH:mm");

export const sdt = (ms: number): string => dayjs(ms).format("DD/MM HH:mm");

export function hm(h: number): string {
  h = Math.max(0, h);
  const m = Math.round(h * 60);
  if (m < 60) return m + " min";
  const H = Math.floor(m / 60);
  const M = m % 60;
  return M ? `${H} h ${M} min` : `${H} h`;
}

export function dur(h: number): string {
  h = Math.max(0, h);
  const f = (x: number) => (Math.round(x * 10) / 10).toLocaleString("es-CO");
  if (h < 1) return Math.round(h * 60) + " min";
  if (h < 24) return f(h) + " h";
  if (h < 720) return f(h / 24) + " d";
  const ms = h / 730;
  return f(ms) + (Math.round(ms * 10) / 10 === 1 ? " mes" : " meses");
}

export function ago(h: number): string {
  if (h > 1e6) return "sin registro";
  return h < 1 / 60 ? "ahora" : h < 24 ? "hace " + hm(h) : "hace " + dur(h);
}

export function cop(n: number): string {
  const rounded = Math.round(n);
  // formatMoney devuelve "" para 0
  return rounded ? formatMoney(rounded) : "$ 0";
}
