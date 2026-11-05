"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useVehicleTowerStore } from "../../store/useVehicleTowerStore";
import { MIN } from "../../lib/time";
import { RangePicker } from "./RangePicker";
import styles from "./TimeBar.module.scss";

const PLAY_TICK_MS = 90;
const PLAY_STEPS = 140;
const EXPAND_SELECTOR = 'button[aria-label="Mostrar panel de flota"]';

export interface ITimeBarProps {
  collapsed?: boolean;
}

export function TimeBar({ collapsed }: ITimeBarProps) {
  const range = useVehicleTowerStore((s) => s.historyRange);
  const cursor = useVehicleTowerStore((s) => s.historyCursor);
  const setCursor = useVehicleTowerStore((s) => s.setHistoryCursor);
  const [playing, setPlaying] = useState(false);
  const barRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number; width: number } | null>(null);

  useEffect(() => {
    setPlaying(false);
  }, [range.from, range.to]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const { historyCursor, historyRange } = useVehicleTowerStore.getState();
      const stepMin = Math.max(
        5,
        Math.round((historyRange.to - historyRange.from) / MIN / PLAY_STEPS / 5) * 5
      );
      const next = historyCursor + stepMin * MIN;
      if (next >= historyRange.to) setPlaying(false);
      setCursor(Math.min(next, historyRange.to));
    }, PLAY_TICK_MS);
    return () => clearInterval(id);
  }, [playing, setCursor]);

  useLayoutEffect(() => {
    const host = barRef.current?.parentElement;
    const expand = collapsed ? host?.querySelector<HTMLElement>(EXPAND_SELECTOR) : null;
    if (!host || !expand) {
      setPos(null);
      return;
    }
    const place = () => {
      const left = expand.offsetLeft + expand.offsetWidth + 8;
      const room = host.clientWidth - left - 60;
      setPos({ left, top: expand.offsetTop, width: Math.max(260, Math.min(560, room)) });
    };
    place();
    const obs = new ResizeObserver(place);
    obs.observe(host);
    obs.observe(expand);
    return () => obs.disconnect();
  }, [collapsed]);

  const onPlay = () => {
    if (playing) return setPlaying(false);
    if (cursor >= range.to) setCursor(range.from);
    setPlaying(true);
  };

  const pct = ((cursor - range.from) / (range.to - range.from || 1)) * 100;

  return (
    <div
      ref={barRef}
      className={styles.timebar}
      style={
        pos ? { left: pos.left, top: pos.top, width: pos.width, transform: "none" } : undefined
      }
    >
      <RangePicker />
      <div className={styles.hist}>
        <button
          type="button"
          className={styles.play}
          aria-label={playing ? "Pausar" : "Reproducir"}
          onClick={onPlay}
        >
          <svg viewBox="0 0 12 12" aria-hidden>
            {playing ? <path d="M2 1h3v10H2zM7 1h3v10H7z" /> : <path d="M2 1l9 5-9 5z" />}
          </svg>
        </button>
        <input
          type="range"
          className={styles.slider}
          aria-label="Hora del histórico"
          min={range.from}
          max={range.to}
          step={5 * MIN}
          value={cursor}
          style={{ ["--p" as string]: `${pct}%` }}
          onPointerDown={() => setPlaying(false)}
          onChange={(e) => {
            setPlaying(false);
            setCursor(Number(e.target.value));
          }}
        />
      </div>
    </div>
  );
}
