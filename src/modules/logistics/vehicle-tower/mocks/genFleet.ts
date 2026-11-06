import { CARRIER_CONTACTS, CITY_COORDS, CURATED_SEEDS, seedToTrip } from "./curatedFleet";
import type { IMockSeed, MockSegment } from "./curatedFleet";
import type { IMockTrip } from "./mockSim";

const REAL: Record<string, [number, number]> = {
  "Sin iniciar": [101, 350170711],
  Cargando: [5, 26460640],
  "En curso": [86, 824653517],
  Descargando: [8, 20043294],
  "Stand by": [29, 448600760],
  Detenido: [10, 39917323]
};

const VP_CLUSTERS: Record<string, string[]> = {
  VRC: ["Cota", "Mosquera", "Bogotá", "Neiva", "Aipe", "Girardot", "La Dorada"],
  VPI: ["Yopal", "Aguazul", "Tauramena", "Villanueva", "Monterrey", "Paz de Ariporo", "Trinidad"],
  VRO: [
    "Barrancabermeja",
    "Puerto Wilches",
    "Sabana de Torres",
    "Cúcuta",
    "Tibú",
    "Bucaramanga",
    "Puerto Boyacá",
    "Arauca",
    "Saravena"
  ],
  VRN: ["Cartagena", "Barranquilla", "Coveñas", "Sincelejo"],
  VAO: [
    "Villavicencio",
    "Acacías",
    "Castilla La Nueva",
    "Granada",
    "Puerto Gaitán",
    "Campo Rubiales"
  ]
};
type Weighted = Array<[string, number]>;
const VP_W: Weighted = [
  ["VRC", 43],
  ["VRO", 25],
  ["VPI", 19],
  ["VRN", 7],
  ["VAO", 6]
];
const MOD_W: Weighted = [
  ["Personas", 57],
  ["Carga", 38],
  ["Izaje", 5]
];
const VEH_BY: Record<string, Weighted> = {
  Personas: [
    ["CAMIONETA 4X4", 90],
    ["VAN 9 PASAJEROS", 10]
  ],
  Carga: [
    ["C-100", 28],
    ["MINIMULA C2S2", 16],
    ["CABEZOTE", 14],
    ["C-350", 12],
    ["C-600", 11],
    ["TRACTOMULA", 8],
    ["TRACTOCAMION 34 TON", 6],
    ["CARROTANQUE", 5]
  ],
  Izaje: [
    ["CAMA BAJA", 45],
    ["GRÚA 30 TON", 30],
    ["MONTACARGAS", 25]
  ]
};
const PSL_W: Weighted = [
  ["Completion Tools", 54],
  ["Production Solutions", 49],
  ["Wireline & Perforating", 48],
  ["Baroid", 38],
  ["Cementing", 35],
  ["Multi-Chem", 24],
  ["Testing & Subsea", 15],
  ["Sperry Drilling Services", 11],
  ["Artificial Lift", 9],
  ["Production Enhancement", 3]
];
const PROV_REAL: Weighted = [
  ["Servi Trans Cóndor", 41],
  ["Lidertur", 40],
  ["Transcastañeda", 21],
  ["Grupo Transdelta", 19],
  ["NG Business Group", 18],
  ["Transportes Las Corocoras", 13],
  ["Comdisol Villanueva", 12],
  ["Transportes Vigía", 11],
  ["Coltanques", 10],
  ["Montacargas Nacionales", 9],
  ["RH Group", 9]
];
const NOMBRES = [
  "Carlos",
  "Jhon",
  "Luis",
  "Andrés",
  "Jorge",
  "Edwin",
  "Wilmer",
  "Fredy",
  "Yesid",
  "Hernán",
  "Diego",
  "Camilo",
  "Orlando",
  "Nelson",
  "Rafael",
  "Alexander",
  "Julián",
  "Ferney",
  "Robinson",
  "Darío"
];
const APELL = [
  "Rodríguez",
  "Gómez",
  "Martínez",
  "Pérez",
  "Sánchez",
  "Ramírez",
  "Torres",
  "Rojas",
  "Vargas",
  "Moreno",
  "Castro",
  "Ortiz",
  "Rincón",
  "Suárez",
  "Cárdenas",
  "Mejía",
  "Ospina",
  "Salazar",
  "Patiño",
  "Becerra"
];
const SOL_N = [
  "Ana María Duarte",
  "Felipe Cruz",
  "Daniela Ríos",
  "Mauricio León",
  "Laura Quintero",
  "Sebastián Pardo",
  "Paola Arango",
  "Iván Medina",
  "Juliana Mora",
  "Ricardo Peña",
  "Valentina Gil",
  "Óscar Niño"
];

export interface IGeneratedFleet {
  seeds: IMockSeed[];
  newContacts: Record<string, [string, string]>;
}

export function genFleet(base: IMockSeed[]): IGeneratedFleet {
  let seed = 20261102;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const pick = (w: Weighted): string => {
    const t = w.reduce((m, x) => m + x[1], 0);
    let r = rnd() * t;
    for (const x of w) {
      r -= x[1];
      if (r <= 0) return x[0];
    }
    return w[0][0];
  };
  const any = (a: string | string[]): string => a[Math.floor(rnd() * a.length)];
  const rng = (a: number, b: number) => a + rnd() * (b - a);
  const ph = () =>
    "3" +
    String(Math.floor(rnd() * 3) * 1 + 10 + Math.floor(rnd() * 10)) +
    " " +
    String(100 + Math.floor(rnd() * 900)) +
    " " +
    String(1000 + Math.floor(rnd() * 9000));
  const plate = () => {
    const L = "ABCDEFGHJKLMNPRSTUVWXYZ";
    return any(L) + any(L) + any(L) + " " + String(100 + Math.floor(rnd() * 900));
  };
  const km = (a: string, b: string) => {
    const P = CITY_COORDS;
    const R = 6371;
    const r = Math.PI / 180;
    const x =
      Math.sin(((P[b][1] - P[a][1]) * r) / 2) ** 2 +
      Math.cos(P[a][1] * r) * Math.cos(P[b][1] * r) * Math.sin(((P[b][0] - P[a][0]) * r) / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x)) * 1.3;
  };
  const have: Record<string, number> = {};
  base.forEach((r) => {
    const st = r.tmsNow;
    if (st) have[st] = (have[st] || 0) + 1;
  });
  const out: IMockSeed[] = [];
  let n = 0;
  Object.entries(REAL).forEach(([st, [cnt]]) => {
    for (let k = 0; k < cnt - (have[st] || 0); k++) {
      n++;
      const vp = pick(VP_W);
      const clu = VP_CLUSTERS[vp];
      const o = any(clu);
      let d = any(clu.filter((c) => c !== o));
      if (rnd() < 0.18) d = vp === "VRC" ? any(VP_CLUSTERS.VPI) : "Bogotá";
      if (d === o) d = "Bogotá";
      const mod = pick(MOD_W) as "Personas" | "Carga" | "Izaje";
      const tipo = pick(VEH_BY[mod]);
      const distance = Math.max(15, km(o, d));
      const dur = Math.max(1.2, distance / 42 + 0.6);
      let s: MockSegment[] = [];
      let sal = 0;
      let fu: number[] = [];
      let ping = 99;
      if (st === "Sin iniciar") {
        if (rnd() < 0.72) {
          sal = rng(0.6, 22);
          s = [["Sin iniciar", -rng(2, 30), 60, 0, 0]];
          fu = [-rng(0.5, 6)];
        } else {
          sal = -rng(0.7, 9);
          s = [["Sin iniciar", sal - rng(2, 12), 60, 0, 0]];
          fu = [sal - rng(0.3, 2)];
        }
      } else if (st === "Cargando") {
        const c = rng(0.3, 3.5);
        sal = -c + rng(-0.5, 1.2);
        s = [
          ["Sin iniciar", -c - 6, -c, 0, 0],
          ["Cargando", -c, 60, 0, 0]
        ];
        fu = [-c + 0.1];
      } else if (st === "En curso") {
        const t0 = Math.min(dur * 0.95, rng(0.3, dur));
        sal = -t0 - rng(0, 0.8);
        s = [
          ["Cargando", -t0 - rng(0.4, 1.5), -t0, 0, 0],
          ["En ruta", -t0, -t0 + dur, 0, 1]
        ];
        const lag = rnd();
        fu =
          lag < 0.1
            ? [-t0 - 0.6]
            : Array.from({ length: Math.ceil(t0 / 2.6) + 1 }, (_, q) => -t0 + q * 2.6).filter(
                (x) => x < 0
              );
        if (rnd() < 0.08) ping = -rng(0.6, 3);
      } else if (st === "Descargando") {
        const a = rng(0.3, 4.8);
        sal = -a - dur - rng(0.5, 1.5);
        s = [
          ["En ruta", -a - dur, -a, 0, 1],
          ["Descargando", -a, 60, 1, 1]
        ];
        fu = [-a, -a / 2];
      } else if (st === "Stand by") {
        const b = rnd() < 0.5 ? rng(0.5, 8) : rng(8, 60);
        sal = -b - dur - rng(0.5, 2);
        s = [
          ["En ruta", -b - dur, -b, 0, 1],
          ["Stand by", -b, 60, 1, 1]
        ];
        fu = [-b, -b / 2, -rng(0.2, 3)];
      } else if (st === "Detenido") {
        const f = rng(0.15, 0.85);
        const t0 = dur * f + rng(0.4, 5);
        const dd = rng(0.45, 5);
        sal = -t0 - 1;
        s = [
          ["En ruta", -t0, -dd, 0, f],
          ["Detenido", -dd, 60, f, f]
        ];
        fu = [-t0, -dd + 0.1];
      }
      const prov = pick(PROV_REAL);
      const psl = pick(PSL_W);
      out.push({
        pl: plate(),
        mun: o.toUpperCase(),
        tipo,
        prov,
        cond: `${any(NOMBRES)} ${any(APELL)}`,
        tel: ph(),
        reg: vp,
        an: Math.floor(rnd() * 4),
        tr: "TR-" + (41000 + n * 7),
        ruta: [o, d],
        sal,
        dur,
        costo: 0,
        s,
        fu,
        ping,
        mod,
        psl,
        sol: [any(SOL_N), psl, ph()],
        gen: true,
        tmsNow: st,
        jit: [rng(-0.05, 0.05), rng(-0.05, 0.05)]
      });
    }
  });
  Object.entries(REAL).forEach(([st, [, tot]]) => {
    const g = out.filter((x) => x.tmsNow === st);
    const fixed = base.filter((r) => r.tmsNow === st).reduce((m, r) => m + (r.costo ?? 0), 0);
    const w = g.map(() => 0.4 + rnd() * 1.6);
    const sw = w.reduce((a, b) => a + b, 0);
    g.forEach((x, k) => {
      x.costo = Math.round(((tot - fixed) * w[k]) / sw / 1000) * 1000;
    });
    if (g.length) {
      const rest = g.slice(0, -1).reduce((m, x) => m + (x.costo ?? 0), 0);
      g[g.length - 1].costo = tot - fixed - rest;
    }
  });
  const newContacts: Record<string, [string, string]> = {};
  // Se conserva el consumo de números aleatorios del prototipo (incluido el teléfono de la torre del proveedor).
  const seenTower: Record<string, boolean> = {};
  Object.keys(CARRIER_CONTACTS).forEach((p) => (seenTower[p] = true));
  out.forEach((x) => {
    if (!CARRIER_CONTACTS[x.prov] && !newContacts[x.prov]) {
      newContacts[x.prov] = ["Despacho · " + any(NOMBRES) + " " + any(APELL), ph()];
    }
    if (!seenTower[x.prov]) {
      seenTower[x.prov] = true;
      rnd();
      rnd();
      rnd();
    }
  });
  return { seeds: out, newContacts };
}

export function buildMockTrips(now: Date): IMockTrip[] {
  const { seeds, newContacts } = genFleet(CURATED_SEEDS);
  const contacts = { ...CARRIER_CONTACTS, ...newContacts };
  return CURATED_SEEDS.concat(seeds).map((seed, i) => seedToTrip(seed, i, now, contacts));
}
