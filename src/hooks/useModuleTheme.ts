"use client";
import { useCallback, useEffect, useState } from "react";
import type { ThemePreference } from "@/context/ThemeMenuContext";

const THEME_KEY = "tms-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

function temaGuardado(): ThemePreference {
  try {
    const t = window.localStorage.getItem(THEME_KEY);
    return t === "light" || t === "dark" || t === "system" ? t : "system";
  } catch {
    return "system";
  }
}

export function useModuleTheme() {
  const [theme, setThemeState] = useState<ThemePreference>("system");
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => setThemeState(temaGuardado()), []);

  useEffect(() => {
    const mq = window.matchMedia(DARK_QUERY);
    setSystemDark(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((t: ThemePreference) => {
    setThemeState(t);
    try {
      window.localStorage.setItem(THEME_KEY, t);
    } catch {
    }
  }, []);

  const resolvedMode: "light" | "dark" =
    theme === "system" ? (systemDark ? "dark" : "light") : theme;

  return { theme, setTheme, resolvedMode };
}
