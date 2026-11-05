import { Button } from "antd";
import { CornersOut, Minus, Plus } from "phosphor-react";
import styles from "./TowerMap.module.scss";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  drawerOpen?: boolean;
}

export function MapControls({ onZoomIn, onZoomOut, onFit, drawerOpen }: MapControlsProps) {
  return (
    <div className={`${styles.controls} ${drawerOpen ? styles.controlsDrawer : ""}`}>
      <Button
        className={styles.controlBtn}
        icon={<Plus size={16} />}
        onClick={onZoomIn}
        aria-label="Acercar"
        title="Acercar"
      />
      <Button
        className={styles.controlBtn}
        icon={<Minus size={16} />}
        onClick={onZoomOut}
        aria-label="Alejar"
        title="Alejar"
      />
      <Button
        className={styles.controlBtn}
        icon={<CornersOut size={16} />}
        onClick={onFit}
        aria-label="Ver toda la flota"
        title="Ver toda la flota"
      />
    </div>
  );
}
