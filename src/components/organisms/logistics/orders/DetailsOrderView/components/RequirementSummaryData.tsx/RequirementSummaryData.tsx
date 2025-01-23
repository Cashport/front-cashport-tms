import { Col, Divider, Flex, Row } from "antd";
import styles from "./RequirementSummaryData.module.scss";
import { formatDatePlaneWithoutComma } from "@/utils/utils";
import { OtherReq } from "@/types/logistics/carrier/carrier";

interface RequirementSummaryDataProps {
  title?: string;
  routeGeometry?: any;
  user_creator: {
    user_name: string;
    user_email: string;
    show: boolean;
  };
  start_location: string;
  end_location: string;
  start_date_flexible: string;
  end_date_flexible: string;
  start_date: string;
  start_date_hour: string;
  end_date: string;
  end_date_hour: string;
  other_requirement: OtherReq;
}

export const RequirementSummaryData = ({
  title,
  routeGeometry,
  user_creator,
  other_requirement,
  start_location,
  end_location,
  start_date,
  start_date_hour,
  end_date,
  end_date_hour,
  start_date_flexible,
  end_date_flexible
}: RequirementSummaryDataProps) => {
  const typeOfService = `${other_requirement.description} (${other_requirement.units})`;
  return (
    <Flex vertical className={styles.container} style={{ width: "100%" }}>
      {title && <p className={styles.sectionTitle}>{title || "Resumen"}</p>}
      {routeGeometry && (
        <Row className={styles.divdistance} style={{ marginBottom: "2rem" }}>
          <Col span={12} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <p className={styles.subtitleReg}>Tiempo de servicio</p>
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
            <p className={styles.subtitle}>{other_requirement.serviceTime}</p>
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
          <p className={styles.subtitleReg}>Tipo de servicio</p>
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
          <p className={styles.bodyStrong}>{typeOfService}</p>
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
