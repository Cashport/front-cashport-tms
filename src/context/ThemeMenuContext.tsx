"use client";

import { createContext, useContext } from "react";

/* Tema del módulo para el menú del avatar (DESIGN.md §4.9): los módulos con modo oscuro
   (Torre de control) publican aquí su preferencia y el menú del usuario muestra
   "Tema: Claro / Oscuro / Sistema". Sin proveedor, el menú no lo muestra: ese módulo no
   tiene modo oscuro. Mismo contrato que en Cashport. */

export type ThemePreference = "light" | "dark" | "system";

export interface ThemeMenuValue {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}

export const ThemeMenuContext = createContext<ThemeMenuValue | null>(null);

export const useThemeMenu = () => useContext(ThemeMenuContext);
