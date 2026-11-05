import { toMs } from "../../lib/time";
import type { IVehicleTowerFollowUpFile, IVehicleTowerTrip } from "../../types/vehicleTower";

export const TMS_STATE_KEY: Record<string, string> = {
  "Sin iniciar": "sin",
  Cargando: "carg",
  "En curso": "ruta",
  Descargando: "desc",
  Detenido: "det",
  "Stand by": "sb"
};

export function kb(n: number): string {
  return n > 1048576
    ? (n / 1048576).toFixed(1).replace(".", ",") + " MB"
    : Math.max(1, Math.round(n / 1024)) + " KB";
}

export const fileExt = (name: string): string =>
  (name.split(".").pop() ?? "").toUpperCase().slice(0, 4);

export function fileKind(name: string): "pdf" | "img" | "xls" | "mail" | "aud" | "doc" {
  const ext = (name.split(".").pop() ?? "").toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "heic"].includes(ext)) return "img";
  if (["xls", "xlsx", "csv"].includes(ext)) return "xls";
  if (["eml", "msg"].includes(ext)) return "mail";
  if (["mp3", "m4a", "ogg", "wav"].includes(ext)) return "aud";
  return "doc";
}

export type LogKind = "app" | "sys" | "com" | "call" | "asg" | "chg" | "cost";

export interface ILogEntry {
  id: string;
  at: number;
  kind: LogKind;
  who: string;
  role?: string;
  text: string;
  tag?: string;
  state?: string;
  outcome?: string;
  amount?: number;
  approved?: boolean;
  files?: IVehicleTowerFollowUpFile[];
}

export function buildLog(trip: IVehicleTowerTrip, t: number): ILogEntry[] {
  const out: ILogEntry[] = [];
  trip.appEvents.forEach((e, i) =>
    out.push({
      id: `ev-${i}`,
      at: toMs(e.eventTime),
      kind: e.fromApp ? "app" : "sys",
      who: "Sistema TMS",
      text: e.eventType
    })
  );
  (trip.logEvents ?? []).forEach((e, i) =>
    out.push({
      id: `lg-${i}`,
      at: toMs(e.at),
      kind: e.kind === "assignment" ? "asg" : e.kind === "resourceChange" ? "chg" : "cost",
      who: e.who,
      role: e.role,
      text: e.text,
      tag: e.tag,
      amount: e.amount,
      approved: e.approved
    })
  );
  for (const f of trip.followUps) {
    const answered = f.outcome === null ? "com" : f.contacted ? "call" : "sys";
    out.push({
      id: f.id,
      at: toMs(f.createdAt),
      kind: answered,
      who: f.createdBy,
      role: "Analista",
      text: f.description,
      state: f.reportedStatus ?? undefined,
      outcome: f.outcome ?? undefined,
      files: f.files
    });
  }
  return out.filter((x) => x.at <= t).sort((a, b) => b.at - a.at);
}
