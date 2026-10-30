"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ConfigProvider, message, theme as antdTheme } from "antd";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import Loader from "@/components/atoms/loaders/loader";
import { ThemeMenuContext, ThemePreference } from "@/context/ThemeMenuContext";
import { getControlTowerData } from "@/services/logistics/control-tower";
import { IControlTowerApi } from "@/types/logistics/controlTower/controlTower";
import { adaptarDatos } from "./adaptarDatos";
import { HEADER_ACTIONS_HTML, HEADER_CUT_HTML, PAGE_HTML } from "./markup";
// @ts-ignore: torre.js es el JS del prototipo aprobado (sin tipos)
import { montarTorre } from "./torre";
import "./torre.css";

const THEME_KEY = "tms-theme";

/** Tema guardado; por defecto "Sistema", que en la Torre son los colores del cliente (HU). */
function temaGuardado(): ThemePreference {
  try {
    const t = window.localStorage.getItem(THEME_KEY);
    return t === "light" || t === "dark" || t === "system" ? t : "system";
  } catch {
    return "system";
  }
}

interface TorreHandle {
  setTema: (t: ThemePreference) => void;
  desmontar: () => void;
}

/**
 * Torre de control TMS (HU 1dfjxwuzq6d). El tablero es el prototipo aprobado en JS + SVG
 * propio (torre.js); este componente pone el shell del TMS, pide los datos y lo monta.
 * Cada carga usa un `version` nuevo para que React cree el DOM de cero y torre.js
 * no acumule listeners sobre el anterior.
 *
 * Tema (DESIGN.md §4.9 y §8): se elige en el menú del avatar. En Oscuro toda la vista
 * (menú lateral, header, contenido, modales) usa los tokens oscuros de Cashport.
 */
export function ControlTower() {
  const [data, setData] = useState<IControlTowerApi | null>(null);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [theme, setThemeState] = useState<ThemePreference>("system");
  const torre = useRef<TorreHandle | null>(null);
  const isDark = theme === "dark";

  useEffect(() => setThemeState(temaGuardado()), []);

  const setTheme = useCallback((t: ThemePreference) => {
    setThemeState(t);
    try {
      window.localStorage.setItem(THEME_KEY, t);
    } catch {
      /* sin almacenamiento: el tema dura la sesión */
    }
  }, []);

  // CSS no puede pintar un ancestro: el fondo del <body> y los portales leen tms-dark.
  useEffect(() => {
    document.body.classList.toggle("tms-dark", isDark);
    return () => document.body.classList.remove("tms-dark");
  }, [isDark]);

  useEffect(() => {
    torre.current?.setTema(theme);
  }, [theme]);

  const cargar = useCallback(async () => {
    try {
      const res = await getControlTowerData();
      setData(res);
      setError(null);
      setVersion((v) => v + 1);
    } catch (e: any) {
      setError(e?.message || "No se pudieron cargar los datos");
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    if (!data || !version) return;
    try {
      torre.current = montarTorre(adaptarDatos(data), {
        tema: temaGuardado(),
        recargar: () => {
          cargar().then(() => message.success("Datos recargados"));
        }
      });
    } catch (e) {
      console.error("Torre de control: error al montar el tablero", e);
      setError("No se pudo mostrar el tablero");
    }
    return () => {
      torre.current?.desmontar();
      torre.current = null;
    };
  }, [data, version, cargar]);

  const listo = !!data && !error;
  const dataTheme = theme === "system" ? "hal" : theme;

  return (
    <ThemeMenuContext.Provider value={{ theme, setTheme }}>
      <ConfigProvider
        theme={{
          algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: "#CBE71E",
            fontFamily: "inherit",
            ...(isDark && {
              colorText: "rgba(255, 255, 255, 0.85)",
              colorTextSecondary: "rgba(255, 255, 255, 0.65)",
              colorTextPlaceholder: "rgba(255, 255, 255, 0.25)",
              colorSplit: "rgba(253, 253, 253, 0.12)",
              colorBgElevated: "#1f1f1f"
            })
          }
        }}
      >
        <ViewWrapper
          headerTitle="Torre de control TMS"
          className={isDark ? "dark" : ""}
          headerTitleExtra={
            listo ? (
              <div
                key={`cut-${version}`}
                className="torre torre-hdr"
                data-theme={dataTheme}
                dangerouslySetInnerHTML={{ __html: HEADER_CUT_HTML }}
              />
            ) : null
          }
          headerActions={
            listo ? (
              <div
                key={`act-${version}`}
                className="torre torre-hdr"
                data-theme={dataTheme}
                dangerouslySetInnerHTML={{ __html: HEADER_ACTIONS_HTML }}
              />
            ) : null
          }
        >
          {error ? (
            <div style={{ padding: 24, color: "rgb(var(--cp-ink-3))" }}>{error}</div>
          ) : !data ? (
            <Loader />
          ) : (
            <div
              key={`page-${version}`}
              className="torre torre-body"
              data-theme={dataTheme}
              dangerouslySetInnerHTML={{ __html: PAGE_HTML }}
            />
          )}
        </ViewWrapper>
      </ConfigProvider>
    </ThemeMenuContext.Provider>
  );
}
