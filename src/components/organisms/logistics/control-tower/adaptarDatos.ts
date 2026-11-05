import { IControlTowerApi } from "@/types/logistics/controlTower/controlTower";

/*
 * Convierte la respuesta de GET /control-tower en las estructuras que consume torre.ts
 * (las mismas que entregaba mock.js en el prototipo; ver "Contrato de datos" de la HU).
 * Los meses van por índice: 12 meses que terminan en el mes del corte (CUR = 11).
 */

const MN = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const SIN = {
  psl: "Sin PSL",
  vp: "Sin VP",
  prov: "Sin proveedor",
  loc: "Sin ubicación",
  veh: "Sin vehículo"
};

/** 'YYYY-MM-DD HH:mm:ss' (hora de Colombia) → Date local. */
function parseLocal(s: string | null | undefined): Date | null {
  if (!s) return null;
  const [d, t = "00:00:00"] = s.split(" ");
  const [y, m, day] = d.split("-").map(Number);
  const [h, mi, se] = t.split(":").map(Number);
  return new Date(y, m - 1, day, h || 0, mi || 0, se || 0);
}

const num = (v: unknown) => Number(v) || 0;

/** 'YYYY-MM-DD' → Date local a medianoche. */
function fechaLocal(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Días calendario de a hasta b (sin la hora; negativo si b es anterior). */
function diasEntre(a: Date, b: Date): number {
  return Math.round(
    (new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime() -
      new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime()) /
      864e5
  );
}

/** Periodos de la API; si no vienen, los 12 meses calendario que terminan en el del corte. */
function periodosDe(api: IControlTowerApi, corte: Date) {
  if (api.periodos?.length) return api.periodos;
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return Array.from({ length: 12 }, (_, i) => {
    const ini = new Date(corte.getFullYear(), corte.getMonth() - 11 + i, 1);
    const fin = new Date(ini.getFullYear(), ini.getMonth() + 1, 0);
    return {
      y: ini.getFullYear(),
      m: ini.getMonth() + 1,
      desde: iso(ini),
      hasta: iso(fin),
      actual: i === 11
    };
  });
}

function masFrecuente(valores: string[]) {
  const c: Record<string, number> = {};
  valores.forEach((v) => (c[v] = (c[v] || 0) + 1));
  return Object.keys(c).sort((a, b) => c[b] - c[a])[0];
}

export function adaptarDatos(api: IControlTowerApi) {
  const NOW_T = parseLocal(api.corte) as Date;

  // ---- periodos: meses del proyecto (calendario o su corte, p. ej. 26 a 25) ----
  // Cada uno con su fecha de inicio y de fin; "day" de un servicio es el día dentro de su periodo.
  const PERIODOS = periodosDe(api, NOW_T).map((p) => {
    const start = fechaLocal(p.desde);
    const end = fechaLocal(p.hasta);
    const m = p.m - 1;
    return {
      y: p.y,
      m,
      label: MN[m] + " " + String(p.y).slice(2),
      start,
      end,
      days: diasEntre(start, end) + 1,
      actual: p.actual
    };
  });
  const MONTHS = PERIODOS.slice(0, PERIODOS.findIndex((p) => p.actual) + 1);
  const CUR = MONTHS.length - 1;
  const diaDelPeriodo = (d: Date, i: number) => diasEntre(MONTHS[i].start, d) + 1;
  const ELAPSED = diaDelPeriodo(NOW_T, CUR);
  const DAYS_CUR = MONTHS[CUR].days;
  const monthIndex = (d: Date) =>
    MONTHS.findIndex((p) => diasEntre(p.start, d) >= 0 && diasEntre(d, p.end) >= 0);

  // ---- tipos de servicio ----
  const tipoNombre: Record<string, string> = {};
  api.tipos.forEach((t) => (tipoNombre[String(t.id)] = t.nombre));
  const tipoDe = (id: number | null | undefined) =>
    id != null && tipoNombre[String(id)] ? String(id) : "0";
  if (!tipoNombre["0"]) tipoNombre["0"] = "Sin tipo";

  // ---- usuarios (solicitantes): índice propio, igual que el prototipo ----
  const USERS: {
    id: number;
    name: string;
    psl: string;
    vp: string;
    cc: string;
    _psl: string[];
    _vp: string[];
  }[] = [];
  const userIdx: Record<string, number> = {};
  const usuario = (u: number | null | undefined) => {
    const key = u == null ? "-" : String(u);
    if (userIdx[key] === undefined) {
      userIdx[key] = USERS.length;
      USERS.push({
        id: USERS.length,
        name: u == null ? "Sin solicitante" : api.usuarios[key] || "Usuario " + key,
        psl: SIN.psl,
        vp: SIN.vp,
        cc: "",
        _psl: [],
        _vp: []
      });
    }
    return userIdx[key];
  };

  // ---- servicios (trips) y TRs ----
  const trnDeInterno: Record<string, number> = {};
  const TRIPS: any[] = [];
  const trsMap: Record<string, any> = {};
  api.servicios.forEach((s) => {
    trnDeInterno[s.tr] = s.trn;
    const f = parseLocal(s.f) as Date;
    const m = monthIndex(f);
    if (m < 0) return;
    const user = usuario(s.u);
    const base = num(s.base);
    const sob = num(s.sob);
    const stb = num(s.stb);
    const t = {
      tr: s.trn,
      user,
      psl: s.psl || SIN.psl,
      vp: s.vp || SIN.vp,
      type: tipoDe(s.ty),
      prov: s.prov || SIN.prov,
      mod: s.md,
      km: num(s.km),
      base,
      sob,
      sobNo: num(s.sobNo),
      stb,
      cost: base + sob + stb,
      m,
      day: diaDelPeriodo(f, m),
      veh: s.veh || SIN.veh,
      orig: s.orig || SIN.loc,
      dest: s.dest || SIN.loc,
      drv: s.drv || "",
      plate: s.plate || "",
      appEv: num(s.appEv)
    };
    TRIPS.push(t);
    USERS[user]._psl.push(t.psl);
    USERS[user]._vp.push(t.vp);
    const tr =
      trsMap[s.trn] ||
      (trsMap[s.trn] = {
        id: s.trn,
        user,
        psl: t.psl,
        vp: t.vp,
        m,
        day: t.day,
        trips: [],
        status: s.st,
        value: 0,
        type: t.type
      });
    tr.trips.push(t);
    tr.value += t.cost;
  });
  const TRS = Object.keys(trsMap).map((k) => trsMap[k]);

  // ---- TRs en operación (Solicitudes y En curso) ----
  const hours = (a: Date | null, b: Date | null) =>
    a && b ? (b.getTime() - a.getTime()) / 36e5 : 0;
  const OPS = api.operacion.map((r) => {
    const plan = parseLocal(r.salida) || parseLocal(r.creada) || NOW_T;
    const ult = parseLocal(r.ultSeg);
    const enCurso = ["carg", "ruta", "desc", "stb", "det"].indexOf(r.st) >= 0;
    const user = usuario(r.u);
    return {
      id: r.id,
      st: r.st,
      user,
      psl: r.psl || SIN.psl,
      vp: r.vp || SIN.vp,
      type: tipoDe(r.ty),
      veh: r.veh || SIN.veh,
      orig: r.orig || SIN.loc,
      dest: r.dest || SIN.loc,
      mod: r.md,
      km: num(r.km),
      value: num(r.valor),
      prov: r.prov || undefined,
      drv: r.drv || undefined,
      plate: r.plate || undefined,
      app: !!r.app,
      // sin ningún seguimiento: cuenta desde la salida programada
      lastMin:
        r.st === "sin"
          ? null
          : ult
            ? hours(ult, NOW_T) * 60
            : enCurso && plan < NOW_T
              ? hours(plan, NOW_T) * 60
              : null,
      plan,
      created: parseLocal(r.creada) || plan,
      stbH:
        r.st === "stb"
          ? Math.round(hours(parseLocal(r.iniStb) || ult || plan, NOW_T) * 2) / 2
          : undefined,
      detH:
        r.st === "det" ? Math.round(hours(parseLocal(r.iniDet) || ult || plan, NOW_T)) : undefined,
      detWhy: r.st === "det" ? r.motivoDet || "Sin motivo registrado" : undefined,
      durH: Math.max(0, hours(parseLocal(r.salida), parseLocal(r.llegada))),
      invAt: parseLocal(r.invitacion) || undefined,
      an: r.analista || ""
    };
  });

  // ---- TRs abiertas sin servicio en la ventana y TOs sin procesar (tarjetas de estado) ----
  const OPEN: any[] = [];
  api.sinProcesar.forEach((o) => {
    const creada = parseLocal(o.creada) || NOW_T;
    OPEN.push({
      id: o.id,
      user: usuario(o.u),
      psl: o.psl || SIN.psl,
      vp: o.vp || SIN.vp,
      type: tipoDe(o.ty),
      status: "sinp",
      m: CUR,
      day: ELAPSED,
      age: Math.max(0, Math.round(hours(creada, NOW_T) * 60)),
      est: 0,
      orig: o.orig || SIN.loc,
      dest: o.dest || SIN.loc
    });
  });
  OPS.forEach((r) => {
    if (trsMap[r.id]) return;
    OPEN.push({
      id: r.id,
      user: r.user,
      psl: r.psl,
      vp: r.vp,
      type: r.type,
      status: ["esp", "asig", "apl"].indexOf(r.st) >= 0 ? "asig" : "curso",
      m: CUR,
      day: ELAPSED,
      age: Math.round(hours(r.created, NOW_T) * 60),
      est: r.value,
      veh: r.veh,
      orig: r.orig,
      dest: r.dest,
      mod: r.mod
    });
  });
  // el analista responsable también va en la TR finalizada (tabla de TRs que requieren atención)
  OPS.forEach((r) => trsMap[r.id] && (trsMap[r.id].an = r.an));

  USERS.forEach((u) => {
    if (u._psl.length) u.psl = masFrecuente(u._psl);
    if (u._vp.length) u.vp = masFrecuente(u._vp);
  });

  // ---- catálogos para los filtros ----
  const todos = [...TRIPS, ...OPS, ...OPEN];
  const unicos = (k: string) =>
    Array.from(new Set(todos.map((x: any) => x[k]).filter(Boolean))).sort() as string[];
  const tiposUsados = unicos("type");
  const TYPES = tiposUsados.map((id, k) => ({
    id,
    name: tipoNombre[id],
    color: `var(--ty${(k % 4) + 1})`
  }));
  const CARGA = (TYPES.find((t) => /carga/i.test(t.name)) || TYPES[0] || { id: "0" }).id;
  const VEH: Record<string, string[]> = {};
  todos.forEach((x: any) => {
    if (!x.veh) return;
    const l = VEH[x.type] || (VEH[x.type] = []);
    if (l.indexOf(x.veh) < 0) l.push(x.veh);
  });
  const CARRIERS = unicos("prov").map((n) => ({
    n,
    t: masFrecuente(TRIPS.filter((t) => t.prov === n).map((t) => t.type)) || CARGA,
    w: 1
  }));

  // ---- contratos, desempeño, comentarios, finalización ----
  const CONTRACTS = api.contratos.map((c) => {
    const total = num(c.total);
    const used = num(c.usado);
    const desc = (c.contrato || "").trim();
    return {
      c: c.proveedor,
      oa: "Contrato " + c.id,
      desc: desc || "Contrato " + c.id,
      total,
      used,
      pu: total ? used / total : 0,
      start: parseLocal(c.inicio) || NOW_T,
      end: parseLocal(c.fin) || NOW_T
    };
  });
  const PKX: Record<string, { resp: number | null; ontime: number | null }> = {};
  api.proveedoresKpi.forEach((p) => (PKX[p.prov] = { resp: p.resp, ontime: p.aTiempo }));
  const COMMENTS: Record<string, any[]> = {};
  Object.keys(api.comentarios).forEach((k) => {
    COMMENTS[k] = api.comentarios[k].map((c) => ({
      ...c,
      who: c.who || "TMS",
      at: parseLocal(c.at) || NOW_T
    }));
  });
  const FIN_AT: Record<string, Date> = {};
  Object.keys(api.finalizadas).forEach((id) => {
    const trn = trnDeInterno[id];
    const f = parseLocal(api.finalizadas[id]);
    if (trn && f) FIN_AT[trn] = f;
  });
  const STBY_RATE: Record<string, number> = {};
  Object.keys(api.standby.tarifaHora).forEach((k) => (STBY_RATE[k] = api.standby.tarifaHora[k]));

  return {
    MONTHS,
    PERIODOS,
    CUR,
    ELAPSED,
    DAYS_CUR,
    NOW_T,
    VPS: unicos("vp"),
    PSLS: unicos("psl"),
    TYPES,
    CARGA,
    CARRIERS,
    USERS: USERS.map(({ _psl, _vp, ...u }) => u),
    TRIPS,
    TRS,
    OPEN,
    OPS,
    VEH,
    LOCS: { todas: Array.from(new Set([...unicos("orig"), ...unicos("dest")])).sort() },
    STBY_FREE: api.standby.horasLibres,
    STBY_RATE,
    CONTRACTS,
    PKX,
    COMMENTS,
    FIN_AT
  };
}
