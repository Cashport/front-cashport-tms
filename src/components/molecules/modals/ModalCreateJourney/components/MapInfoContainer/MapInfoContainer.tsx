import React from "react";
import { Row, Col } from "antd";
import styles from "./MapInfoContainer.module.scss";
import { formatNumber } from "@/utils/utils";

interface MapInfoContainerProps {
  distance: number; // distance in kilometers
  timeTravel: string | null; // formatted time string;
  timeLabel?: string;
}

const MapInfoContainer: React.FC<MapInfoContainerProps> = ({
  distance,
  timeTravel,
  timeLabel = "Tiempo de desplazamiento"
}) => {
  return (
    <Row className={styles.divdistance}>
      <Col span={12} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <p className={styles.subtitleReg}>Distancia Total</p>
        <p className={styles.subtitleReg}>{timeLabel}</p>
      </Col>
      <Col
        span={12}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          alignItems: "flex-end"
        }}
      >
        <p className={styles.subtitle}>{formatNumber(distance)} km</p>
        <p className={styles.subtitle}>{timeTravel ?? ""}</p>
      </Col>
    </Row>
  );
};

export default MapInfoContainer;
