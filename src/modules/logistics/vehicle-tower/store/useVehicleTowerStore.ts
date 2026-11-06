import dayjs from "dayjs";
import { create } from "zustand";
import type { MapStatusTone } from "@/theme/mapPalette";
import { emptyFilters, inScope } from "../lib/filters";
import type { FilterCategoryId, TowerFilters } from "../lib/filters";
import { DEFAULT_PARAMS } from "../lib/params";
import { FOLLOW_UP_OUTCOMES } from "../lib/rules";
import { HR, MIN } from "../lib/time";
import type {
  FleetBucket,
  IFollowUpEntry,
  IFollowUpInput,
  IVehicleTowerParams,
  IVehicleTowerTrip
} from "../types/vehicleTower";

export type TowerMode = "now" | "history";

export type TowerBucketFilter = Exclude<FleetBucket, "idle">;

export interface IHistoryRange {
  from: number;
  to: number;
}

export const HISTORY_MAX_MS = 168 * HR;
export const HISTORY_MIN_SPAN_MS = 5 * MIN;

const defaultRange = (now: number): IHistoryRange => ({ from: now - 24 * HR, to: now });
const DEFAULT_CURSOR_BACK_MS = 6 * HR;

export function clampHistoryRange(now: number, from: number, to: number): IHistoryRange {
  const a = Math.max(now - HISTORY_MAX_MS, Math.min(from, now - HISTORY_MIN_SPAN_MS));
  const b = Math.max(a + HISTORY_MIN_SPAN_MS, Math.min(to, now));
  return { from: a, to: b };
}

interface IVehicleTowerState {
  now: Date;
  trips: IVehicleTowerTrip[];
  params: IVehicleTowerParams;
  selectedTripId: number | null;
  query: string;
  filters: TowerFilters;
  bucket: TowerBucketFilter | null;
  levels: MapStatusTone[];
  showIdle: boolean;
  scope: string | null;
  mode: TowerMode;
  historyRange: IHistoryRange;
  historyRangeCustom: boolean;
  historyCursor: number;
  followUps: Record<number, IFollowUpEntry[]>;
}

interface IVehicleTowerActions {
  tick: () => void;
  setTrips: (trips: IVehicleTowerTrip[]) => void;
  setParams: (params: IVehicleTowerParams) => void;
  selectTrip: (tripId: number | null) => void;
  setQuery: (query: string) => void;
  setFilter: (cat: FilterCategoryId, values: string[]) => void;
  clearFilter: (cat: FilterCategoryId) => void;
  clearFilters: () => void;
  toggleBucket: (bucket: TowerBucketFilter) => void;
  toggleLevel: (level: MapStatusTone, additive?: boolean) => void;
  clearLevels: () => void;
  toggleIdle: () => void;
  setScope: (scope: string | null) => void;
  setMode: (mode: TowerMode) => void;
  setHistoryRange: (from: number, to: number, custom?: boolean) => void;
  setHistoryCursor: (at: number) => void;
  addFollowUp: (tripId: number, input: IFollowUpInput, createdBy?: string) => IFollowUpEntry;
}

export type VehicleTowerStore = IVehicleTowerState & IVehicleTowerActions;

let followUpSeq = 0;

export const useVehicleTowerStore = create<VehicleTowerStore>((set, get) => {
  const initialNow = new Date();
  const range = defaultRange(initialNow.getTime());
  return {
    now: initialNow,
    trips: [],
    params: DEFAULT_PARAMS,
    selectedTripId: null,
    query: "",
    filters: emptyFilters(),
    bucket: null,
    levels: [],
    showIdle: false,
    scope: null,
    mode: "now",
    historyRange: range,
    historyRangeCustom: false,
    historyCursor: range.to - DEFAULT_CURSOR_BACK_MS,
    followUps: {},

    tick: () => set({ now: new Date() }),
    setTrips: (trips) => set({ trips }),
    setParams: (params) => set({ params }),
    selectTrip: (tripId) => set({ selectedTripId: tripId }),
    setQuery: (query) => set({ query }),
    setFilter: (cat, values) => set((s) => ({ filters: { ...s.filters, [cat]: values } })),
    clearFilter: (cat) => set((s) => ({ filters: { ...s.filters, [cat]: [] } })),
    clearFilters: () => set({ filters: emptyFilters() }),
    toggleBucket: (bucket) =>
      set((s) => ({ bucket: s.bucket === bucket ? null : bucket, levels: [] })),
    toggleLevel: (level, additive) =>
      set((s) => {
        const levels = additive
          ? s.levels.includes(level)
            ? s.levels.filter((x) => x !== level)
            : s.levels.concat(level)
          : s.levels.length === 1 && s.levels[0] === level
            ? []
            : [level];
        return { levels, bucket: null };
      }),
    clearLevels: () => set({ levels: [] }),
    toggleIdle: () => set((s) => ({ showIdle: !s.showIdle })),
    setScope: (scope) =>
      set((s) => {
        const sel = s.trips.find((t) => t.tripId === s.selectedTripId);
        return {
          scope: scope || null,
          filters: emptyFilters(),
          selectedTripId: sel && !inScope(sel, scope || null) ? null : s.selectedTripId
        };
      }),
    setMode: (mode) =>
      set((s) => {
        if (mode === s.mode) return {};
        if (mode !== "history" || s.historyRangeCustom) return { mode };
        const now = s.now.getTime();
        const span = s.historyRange.to - s.historyRange.from;
        const back = s.historyRange.to - s.historyCursor;
        const r = clampHistoryRange(now, now - span, now);
        return {
          mode,
          historyRange: r,
          historyCursor: Math.max(r.from, Math.min(r.to - back, r.to))
        };
      }),
    setHistoryRange: (from, to, custom = false) =>
      set((s) => {
        const r = clampHistoryRange(s.now.getTime(), from, to);
        const cursor =
          s.historyCursor < r.from || s.historyCursor > r.to ? r.from : s.historyCursor;
        return { historyRange: r, historyRangeCustom: custom, historyCursor: cursor };
      }),
    setHistoryCursor: (at) =>
      set((s) => ({
        historyCursor: Math.max(s.historyRange.from, Math.min(at, s.historyRange.to))
      })),
    addFollowUp: (tripId, input, createdBy = "Tú") => {
      const outcome = FOLLOW_UP_OUTCOMES.find((o) => o[0] === input.outcome);
      const at = new Date();
      const entry: IFollowUpEntry = {
        id: `local-${tripId}-${++followUpSeq}`,
        tripId,
        createdAt: dayjs(at).toISOString(),
        outcome: input.outcome,
        contacted: outcome ? outcome[1] : false,
        reportedStatus: input.reportedStatus,
        description: input.description.trim(),
        createdBy,
        files: input.files
      };
      set({
        now: at,
        followUps: { ...get().followUps, [tripId]: [...(get().followUps[tripId] || []), entry] }
      });
      return entry;
    }
  };
});
