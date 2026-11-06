"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { ThemeMenuContext } from "@/context/ThemeMenuContext";
import { useModuleTheme } from "@/hooks/useModuleTheme";
import { MAP_ANTD_DARK_TOKENS, MAP_PALETTE, paletteToCssVars } from "@/theme/mapPalette";
import { FleetExpandButton } from "../components/FleetPanel/FleetExpandButton";
import { FleetPanel } from "../components/FleetPanel/FleetPanel";
import { useFilteredFleet } from "../components/FleetPanel/useFilteredFleet";
import { FollowUpForm } from "../components/FollowUp/FollowUpForm";
import { TripLog } from "../components/FollowUp/TripLog";
import { TowerModals } from "../components/Modals/TowerModals";
import type { TowerModalKind } from "../components/Modals/TowerModals";
import { TowerLegend } from "../components/TowerLegend/TowerLegend";
import { TowerHeaderActions } from "../components/TowerHeader/TowerHeaderActions";
import { TowerHeaderTitle } from "../components/TowerHeader/TowerHeaderTitle";
import { TimeBar } from "../components/TimeBar/TimeBar";
import { TowerMap } from "../components/TowerMap/TowerMap";
import { TripDrawer } from "../components/TripDrawer/TripDrawer";
import { useVehicleTower } from "../hooks/useVehicleTower";
import { useVehicleTowerStore } from "../store/useVehicleTowerStore";
import styles from "./VehicleTowerView.module.scss";

const COLLAPSED_KEY = "tc-collapsed";

export function VehicleTowerView() {
  const { theme, setTheme, resolvedMode } = useModuleTheme();
  const isDark = resolvedMode === "dark";
  const { fleet, t } = useVehicleTower();
  const selectedTripId = useVehicleTowerStore((s) => s.selectedTripId);
  const selectTrip = useVehicleTowerStore((s) => s.selectTrip);
  const mode = useVehicleTowerStore((s) => s.mode);
  const nowMs = useVehicleTowerStore((s) => s.now.getTime());
  const filtered = useFilteredFleet(fleet, t);
  // La ficha sale de la flota evaluada completa, no de la filtrada: un filtro no la cierra.
  const selectedItem = useMemo(
    () => (selectedTripId === null ? null : fleet.find((x) => x.trip.tripId === selectedTripId)),
    [fleet, selectedTripId]
  );
  const [collapsed, setCollapsedState] = useState(false);
  const [modal, setModal] = useState<TowerModalKind | null>(null);
  const closeModal = useCallback(() => setModal(null), []);

  useEffect(() => {
    try {
      setCollapsedState(localStorage.getItem(COLLAPSED_KEY) === "1");
    } catch {
      /* sin storage: arranca desplegado */
    }
  }, []);

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value);
    try {
      localStorage.setItem(COLLAPSED_KEY, value ? "1" : "0");
    } catch {
      /* ignorar */
    }
  }, []);

  // Los portales de antd y el fondo del <body> leen tms-dark (igual que la Torre de control).
  useEffect(() => {
    document.body.classList.toggle("tms-dark", isDark);
    return () => document.body.classList.remove("tms-dark");
  }, [isDark]);

  return (
    <ThemeMenuContext.Provider value={{ theme, setTheme }}>
      <ConfigProvider
        theme={{
          algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: MAP_PALETTE.light.cpLime,
            fontFamily: "inherit",
            ...(isDark && MAP_ANTD_DARK_TOKENS)
          }
        }}
      >
        <ViewWrapper
          headerTitle="Mapa"
          headerTitleExtra={<TowerHeaderTitle mode={resolvedMode} />}
          headerActions={<TowerHeaderActions onOpenFilters={() => setModal("filters")} />}
          className={isDark ? "dark" : ""}
        >
          <div className={styles.root} style={paletteToCssVars(resolvedMode)}>
            {!collapsed && (
              <div className={styles.fleetPanel}>
                <FleetPanel filtered={filtered} t={t} onCollapse={() => setCollapsed(true)} />
              </div>
            )}
            <section className={styles.mapZone}>
              {collapsed && (
                <FleetExpandButton
                  counts={filtered.bucketCounts}
                  onClick={() => setCollapsed(false)}
                />
              )}
              <TowerMap
                fleet={filtered.mapFleet}
                t={t}
                nowMs={nowMs}
                selectedTripId={selectedTripId}
                mode={resolvedMode}
                onSelect={selectTrip}
                drawerOpen={!!selectedItem}
              />
              {mode === "history" && <TimeBar collapsed={collapsed} />}
              <TowerLegend onOpenRules={() => setModal("rules")} />
              {selectedItem && (
                <TripDrawer
                  item={selectedItem}
                  t={t}
                  onClose={() => selectTrip(null)}
                  onOpenVehicle={() => setModal("vehicle")}
                  onOpenDriver={() => setModal("driver")}
                  onOpenItems={() => setModal("items")}
                  onOpenObservations={() => setModal("observations")}
                  onOpenRules={() => setModal("rules")}
                  footer={
                    <>
                      {mode === "now" && selectedItem.trip.transferRequest && (
                        <FollowUpForm key={selectedItem.trip.tripId} item={selectedItem} />
                      )}
                      <TripLog trip={selectedItem.trip} t={t} />
                    </>
                  }
                />
              )}
            </section>
          </div>
          <TowerModals
            open={modal}
            onClose={closeModal}
            mode={resolvedMode}
            trip={selectedItem?.trip ?? null}
          />
        </ViewWrapper>
      </ConfigProvider>
    </ThemeMenuContext.Provider>
  );
}
