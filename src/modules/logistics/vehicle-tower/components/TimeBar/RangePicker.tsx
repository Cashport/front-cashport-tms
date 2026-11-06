"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { CalendarBlank, CaretDown } from "phosphor-react";
import { es } from "react-day-picker/locale";
import { Calendar } from "@/modules/chat/ui/calendar";
import { HR, sdt } from "../../lib/time";
import {
  clampHistoryRange,
  HISTORY_MAX_MS,
  useVehicleTowerStore
} from "../../store/useVehicleTowerStore";
import styles from "./TimeBar.module.scss";

const PRESETS: Array<{ hours: number; label: string }> = [
  { hours: 6, label: "Últimas 6 h" },
  { hours: 12, label: "Últimas 12 h" },
  { hours: 24, label: "Últimas 24 h" },
  { hours: 48, label: "Últimas 48 h" },
  { hours: 72, label: "Últimas 72 h" },
  { hours: 168, label: "Últimos 7 días" }
];

const HINT = "Elige el día de inicio y el de fin (máximo 7 días atrás).";
const HINT_ORDER = "La hora final debe ser posterior a la inicial.";
const HINT_MAX = "El histórico permite máximo 7 días: el inicio se ajusta a ese límite.";

const startOfDay = (ms: number | Date): Date => dayjs(ms).startOf("day").toDate();
const toTime = (ms: number): string => dayjs(ms).format("HH:mm");
const withTime = (day: Date, hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return dayjs(day).hour(h).minute(m).second(0).millisecond(0).valueOf();
};

export function RangePicker() {
  const range = useVehicleTowerStore((s) => s.historyRange);
  const custom = useVehicleTowerStore((s) => s.historyRangeCustom);
  const now = useVehicleTowerStore((s) => s.now);
  const setHistoryRange = useVehicleTowerStore((s) => s.setHistoryRange);

  const [open, setOpen] = useState(false);
  const [a, setA] = useState<Date | null>(null);
  const [b, setB] = useState<Date | null>(null);
  const [timeA, setTimeA] = useState("00:00");
  const [timeB, setTimeB] = useState("23:59");
  const [hint, setHint] = useState<{ text: string; error: boolean }>({ text: HINT, error: false });
  const [editing, setEditing] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  const toggle = () => {
    if (open) return close();
    setA(startOfDay(range.from));
    setB(startOfDay(range.to));
    setTimeA(toTime(range.from));
    setTimeB(toTime(range.to));
    setHint({ text: HINT, error: false });
    setEditing(false);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopImmediatePropagation();
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  const pickPreset = (hours: number) => {
    const t = useVehicleTowerStore.getState().now.getTime();
    setHistoryRange(t - hours * HR, t, false);
    close();
  };

  const pickDay = (day: Date) => {
    const d = startOfDay(day);
    if (a === null || b !== null) {
      setA(d);
      setB(null);
    } else if (d < a) {
      setB(a);
      setA(d);
    } else {
      setB(d);
    }
    setEditing(true);
  };

  const apply = () => {
    if (!a) return;
    const t = useVehicleTowerStore.getState().now.getTime();
    let from = withTime(a, timeA || "00:00");
    const to = withTime(b ?? a, timeB || "23:59");
    if (to <= from) {
      setHint({ text: HINT_ORDER, error: true });
      return;
    }
    if (from < t - HISTORY_MAX_MS) {
      setHint({ text: HINT_MAX, error: false });
      from = t - HISTORY_MAX_MS;
    }
    const r = clampHistoryRange(t, from, Math.min(to, t));
    setHistoryRange(r.from, r.to, true);
    close();
  };

  const nowMs = now.getTime();
  const spanMs = range.to - range.from;
  const presetOn = (hours: number) => !editing && !custom && Math.abs(spanMs - hours * HR) < 1000;

  return (
    <div className={styles.rp} ref={wrapRef}>
      <button
        type="button"
        className={styles.rpBtn}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
      >
        <CalendarBlank size={13} aria-hidden />
        <span className={styles.num}>{`${sdt(range.from)} – ${sdt(range.to)}`}</span>
        <CaretDown size={13} className={styles.chv} aria-hidden />
      </button>
      {open && (
        <div className={styles.rpPop} role="dialog" aria-label="Seleccionar rango">
          <div className={styles.rpPre}>
            {PRESETS.map((p) => (
              <button
                key={p.hours}
                type="button"
                className={presetOn(p.hours) ? styles.on : undefined}
                onClick={() => pickPreset(p.hours)}
              >
                {p.label}
              </button>
            ))}
            <span className={styles.rpSep} />
            <button
              type="button"
              className={editing || custom ? styles.on : undefined}
              onClick={() => setEditing(true)}
            >
              Personalizado
            </button>
          </div>
          <div className={styles.rpMain}>
            <div className={styles.rpCal}>
              <Calendar
                mode="range"
                numberOfMonths={2}
                locale={es}
                weekStartsOn={1}
                showOutsideDays={false}
                defaultMonth={a ?? new Date(nowMs)}
                startMonth={new Date(nowMs - HISTORY_MAX_MS)}
                endMonth={new Date(nowMs)}
                selected={a ? { from: a, to: b ?? a } : undefined}
                onDayClick={pickDay}
                disabled={{ before: startOfDay(nowMs - HISTORY_MAX_MS), after: new Date(nowMs) }}
              />
            </div>
            <div className={styles.rpTimes}>
              <label>
                Desde
                <input type="time" value={timeA} onChange={(e) => setTimeA(e.target.value)} />
              </label>
              <label>
                Hasta
                <input type="time" value={timeB} onChange={(e) => setTimeB(e.target.value)} />
              </label>
            </div>
            <div className={hint.error ? `${styles.rpHint} ${styles.err}` : styles.rpHint}>
              {hint.text}
            </div>
            <div className={styles.rpAct}>
              <button type="button" onClick={close}>
                Cancelar
              </button>
              <button type="button" className={styles.pri} onClick={apply}>
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
