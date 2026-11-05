import type { CSSProperties } from "react";

export type MapThemeMode = "light" | "dark";

export type MapStatusTone = "ok" | "med" | "high" | "crit" | "off" | "idle";

export interface MapPaletteTokens {
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;
  line: string;
  lineStrong: string;
  ink: string;
  ink2: string;
  ink3: string;
  accent: string;
  accentSoft: string;
  pill: string;
  pillInk: string;
  railOn: string;
  ok: string;
  okBg: string;
  crit: string;
  critBg: string;
  high: string;
  highBg: string;
  med: string;
  medBg: string;
  off: string;
  offBg: string;
  idle: string;
  sea: string;
  land: string;
  landCo: string;
  border: string;
  dep: string;
  label: string;
  route: string;
  trail: string;
  plate: string;
  plateInk: string;
  sCarg: string;
  sDesc: string;
  sSin: string;
  sPar: string;
  cpLime: string;
  plOrange: string;
  shadow: string;
  onLime: string;
  onSolid: string;
  shadeSoft: string;
  shadeMid: string;
  shadeStrong: string;
  kPdf: string;
  kImg: string;
  kXls: string;
  kMail: string;
  kAud: string;
  kDoc: string;
  paper: string;
  paperInk: string;
  paperFrame: string;
  paperInk2: string;
  paperInk3: string;
  paperLine: string;
}

export const MAP_ANTD_DARK_TOKENS = {
  colorText: "rgba(255, 255, 255, 0.85)",
  colorTextSecondary: "rgba(255, 255, 255, 0.65)",
  colorTextPlaceholder: "rgba(255, 255, 255, 0.25)",
  colorSplit: "rgba(253, 253, 253, 0.12)",
  colorBgElevated: "#1f1f1f"
} as const;

const CP_LIME = "#CBE71E";
const PL_ORANGE = "#FF5500";
const ON_LIME = "#011822";
const ON_SOLID = "#FFFFFF";
const FILE_KINDS = {
  kPdf: "#D9452B",
  kImg: "#0E9AA7",
  kXls: "#1E7A45",
  kMail: "#334455",
  kAud: "#7A4CC2",
  kDoc: "#6B6B73"
};
const PAPER = {
  paper: "#FFFFFF",
  paperInk: "#141416",
  paperFrame: "#F6F6F7",
  paperInk2: "#55555C",
  paperInk3: "#6B6B73",
  paperLine: "#EBEBEE"
};

export const MAP_PALETTE: Record<MapThemeMode, MapPaletteTokens> = {
  light: {
    bg: "#F4F4F5",
    surface: "#FFFFFF",
    surface2: "#F8F8F9",
    surface3: "#EDEDEF",
    line: "#E3E3E7",
    lineStrong: "#C9C9D0",
    ink: "#141416",
    ink2: "#4A4A52",
    ink3: "#86868F",
    accent: "#CE1126",
    accentSoft: "#FBE7EA",
    pill: "#141416",
    pillInk: "#FFFFFF",
    railOn: "#D9F24A",
    ok: "#1E9E5A",
    okBg: "#E3F4EA",
    crit: "#CE1126",
    critBg: "#FBE4E7",
    high: "#E2580C",
    highBg: "#FDEBDF",
    med: "#B7791F",
    medBg: "#FBF1DE",
    off: "#141416",
    offBg: "#E9E9EC",
    idle: "#9A9AA3",
    sea: "#DDE8EE",
    land: "#ECEDE6",
    landCo: "#F8F8F3",
    border: "#B8BCB0",
    dep: "#D5D8CC",
    label: "#5A5D55",
    route: "#141416",
    trail: "#011822",
    plate: "#FFFFFF",
    plateInk: "#141416",
    sCarg: "#2F6FDB",
    sDesc: "#7A4CC2",
    sSin: "#6B6B73",
    sPar: "#0E8A96",
    cpLime: CP_LIME,
    plOrange: PL_ORANGE,
    onLime: ON_LIME,
    onSolid: ON_SOLID,
    ...FILE_KINDS,
    ...PAPER,
    shadow: "0 1px 2px rgba(20,20,22,.06),0 10px 30px rgba(20,20,22,.10)",
    shadeSoft: "rgba(0,0,0,.08)",
    shadeMid: "rgba(0,0,0,.12)",
    shadeStrong: "rgba(0,0,0,.16)"
  },
  dark: {
    bg: "#0F1012",
    surface: "#17181B",
    surface2: "#1C1D21",
    surface3: "#26272C",
    line: "#2A2B31",
    lineStrong: "#3A3B42",
    ink: "#F1F1F3",
    ink2: "#B9B9C1",
    ink3: "#83838C",
    accent: "#F0364C",
    accentSoft: "#3A141A",
    pill: "#F1F1F3",
    pillInk: "#141416",
    railOn: "#C7DE3A",
    ok: "#3FCB82",
    okBg: "#12291D",
    crit: "#FF4D5E",
    critBg: "#3A141A",
    high: "#FF8A4C",
    highBg: "#3A2112",
    med: "#E7B04F",
    medBg: "#33280F",
    off: "#F1F1F3",
    offBg: "#2A2B31",
    idle: "#6E6E77",
    sea: "#141B20",
    land: "#1D1F1E",
    landCo: "#24262A",
    border: "#4A4E52",
    dep: "#33363A",
    label: "#9A9DA3",
    route: "#F1F1F3",
    trail: "#B1BBC1",
    plate: "#F1F1F3",
    plateInk: "#141416",
    sCarg: "#5B93F5",
    sDesc: "#A37BEB",
    sSin: "#9A9AA3",
    sPar: "#2EC4CF",
    cpLime: CP_LIME,
    plOrange: PL_ORANGE,
    onLime: ON_LIME,
    onSolid: ON_SOLID,
    ...FILE_KINDS,
    ...PAPER,
    shadow: "0 1px 2px rgba(0,0,0,.5),0 12px 32px rgba(0,0,0,.5)",
    shadeSoft: "rgba(0,0,0,.08)",
    shadeMid: "rgba(0,0,0,.12)",
    shadeStrong: "rgba(0,0,0,.16)"
  }
};

export const getMapPalette = (mode: MapThemeMode): MapPaletteTokens => MAP_PALETTE[mode];

const toKebab = (name: string) => name.replace(/([A-Z0-9])/g, "-$1").toLowerCase();

export const paletteToCssVars = (mode: MapThemeMode): CSSProperties => {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(MAP_PALETTE[mode])) {
    vars[`--vt-${toKebab(key)}`] = value;
  }
  return vars as CSSProperties;
};
