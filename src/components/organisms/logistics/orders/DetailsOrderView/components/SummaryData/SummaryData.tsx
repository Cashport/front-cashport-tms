import { Col, Divider, Flex, Row } from "antd";
import styles from "./SummaryData.module.scss";
import { formatDatePlaneWithoutComma, formatNumber } from "@/utils/utils";

interface SummaryDataProps {
  title?: string;
  routeGeometry?: any;
  distance?: any;
  timetravel?: any;
  volume?: any;
  weight?: any;
  peopleQuantity?: any;
  travelTypeDesc: string;
  vehiclesSuggested?: any;
  needLiftingOrigin?: boolean | string;
  needLiftingDestination?: boolean | string;
  start_location: string;
  end_location: string;
  start_date_flexible: string;
  end_date_flexible: string;
  start_date: string;
  start_date_hour: string;
  end_date: string;
  end_date_hour: string;
  freight_origin_time?: number;
  freight_destination_time?: number;
  user_creator: {
    user_name: string;
    user_email: string;
    show: boolean;
  };
}

export const SummaryData = ({
  title,
  routeGeometry,
  distance,
  timetravel,
  volume,
  weight,
  user_creator,
  peopleQuantity,
  travelTypeDesc,
  vehiclesSuggested,
  needLiftingOrigin,
  needLiftingDestination,
  start_location,
  end_location,
  start_date_flexible,
  end_date_flexible,
  start_date,
  start_date_hour,
  end_date,
  end_date_hour,
  freight_origin_time = 0,
  freight_destination_time = 0
}: SummaryDataProps) => {
  const hourText = (quantity: number) => (quantity === 1 ? "hora" : "horas");
  return (
    <Flex vertical className={styles.container} style={{ width: "100%" }}>
      {title && <p className={styles.sectionTitle}>{title || "Resumen"}</p>}
      {routeGeometry && (
        <Row className={styles.divdistance} style={{ marginBottom: "2rem" }}>
          <Col span={12} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <p className={styles.subtitleReg}>Distancia Total</p>
            <p className={styles.subtitleReg}>Tiempo Estimado</p>
            {!!volume && <p className={styles.subtitleReg}>Volumen</p>}
            {!!weight && <p className={styles.subtitleReg}>Peso</p>}
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
            <p className={styles.subtitle}>{timetravel}</p>
            {!!volume && <p className={styles.subtitle}>{formatNumber(volume)} m3</p>}
            {!!weight && <p className={styles.subtitle}>{formatNumber(weight)} kg</p>}
          </Col>
        </Row>
      )}
      {user_creator.show && (
        <>
          <Row>
            <Col
              span={12}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "0.5rem"
              }}
            >
              <p className={styles.subtitleReg}>Usuario creador</p>
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
              <p className={styles.bodyStrong}>{user_creator.user_name}</p>
              <p className={styles.bodyStrong}>{user_creator.user_email}</p>
            </Col>
          </Row>
          <Divider className={styles.divider} />
        </>
      )}
      <Row>
        <Col span={12} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <p className={styles.subtitleReg}>Tipo de viaje</p>
          {vehiclesSuggested && <p className={styles.subtitleReg}>Vehículos sugeridos</p>}
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
          <p className={styles.bodyStrong}>{travelTypeDesc}</p>
          {vehiclesSuggested && (
            <p className={styles.bodyStrong} style={{ textAlign: "right" }}>
              {vehiclesSuggested?.map((v: any) => v.vehicle_type_desc).join(",")}
            </p>
          )}
        </Col>
      </Row>
      <Divider className={styles.divider} />
      <Row>
        <Col span={12}>
          <p className={styles.subtitleReg}>Punto Origen</p>
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
          {needLiftingOrigin && !!freight_origin_time && (
            <p className={styles.bodyStrong}>
              Requiere {`${freight_origin_time} ${hourText(freight_origin_time)}`} de izaje
            </p>
          )}
          <p className={styles.bodyStrong}>{start_location}</p>
        </Col>
      </Row>
      <Divider className={styles.divider} />
      <Row>
        <Col span={12}>
          <p className={styles.subtitleReg}>Punto Destino</p>
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
          {needLiftingDestination && !!freight_destination_time && (
            <p className={styles.bodyStrong}>
              Requiere {`${freight_destination_time} ${hourText(freight_destination_time)}`} de
              izaje
            </p>
          )}
          <p className={styles.bodyStrong}>{end_location}</p>
        </Col>
      </Row>
      <Divider className={styles.divider} />
      <Row>
        <Col span={12} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <p className={styles.subtitleReg}>Fecha y hora inicial</p>
          {start_date_flexible && <p className={styles.bodyStrong}>{start_date_flexible}</p>}
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
          <p className={styles.bodyStrong}>{start_date_hour}</p>
          <p className={styles.bodyStrong}>{formatDatePlaneWithoutComma(start_date)}</p>
        </Col>
      </Row>
      <Divider className={styles.divider} />
      <Row>
        <Col span={12} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <p className={styles.subtitleReg}>Fecha y hora final</p>
          {end_date_flexible && <p className={styles.bodyStrong}>{end_date_flexible}</p>}
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
          <p className={styles.bodyStrong}>{end_date_hour}</p>
          <p className={styles.bodyStrong}>{formatDatePlaneWithoutComma(end_date)}</p>
        </Col>
      </Row>
    </Flex>
  );
};
