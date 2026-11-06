import styles from "./TowerMap.module.scss";

interface MapTooltipProps {
  title: string;
  why: string;
  tr: string | null;
  x: number;
  y: number;
  containerWidth: number;
}

const OFFSET = 12;
const MAX_W = 240;

export function MapTooltip({ title, why, tr, x, y, containerWidth }: MapTooltipProps) {
  const flip = x + OFFSET + MAX_W > containerWidth;
  return (
    <div
      className={styles.tooltip}
      role="tooltip"
      style={{
        top: y + OFFSET,
        ...(flip ? { right: containerWidth - x + OFFSET } : { left: x + OFFSET })
      }}
    >
      <b>{title}</b>
      {why}
      {tr ? ` · ${tr}` : ""}
    </div>
  );
}
