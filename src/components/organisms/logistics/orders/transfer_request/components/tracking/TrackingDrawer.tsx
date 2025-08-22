import { ITrackingResponse } from "@/types/logistics/schema";
import { Card, Col, Flex, Row } from "antd";
import { DotsSixVertical } from "phosphor-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Users } from "@phosphor-icons/react";
dayjs.extend(utc);

export default function TrackingDrawer({
  trip,
  hasError
}: Readonly<{
  trip: ITrackingResponse;
  hasError: boolean;
}>) {
  return (
    <Card
      style={{
        width: "100%",
        padding: "0px",
        border: hasError ? "2px solid #F62A2A" : undefined
      }}
    >
      <Row>
        <Col span={2}>
          <DotsSixVertical style={{ fontSize: "20px" }} />
        </Col>
        <Col span={18}>
          <Flex align="center" gap={"0.25rem"}>
            <p>{trip.type_service_desc}</p>
            {trip.is_community ? (
              <Users
                color="#F62A2A"
                style={{ backgroundColor: "#fedfdf", borderRadius: "4px", padding: "4px" }}
                size={24}
                weight="bold"
              />
            ) : null}
          </Flex>
          <p>{trip.start_location_desc}</p>
          {trip.end_location_desc !== trip.start_location_desc && <p>{trip.end_location_desc}</p>}
          <p>
            <b>Inicio</b> {dayjs.utc(trip.start_date).format("DD MMM YYYY - HH:mm")}
          </p>
          <p>
            <b>Fin</b> {dayjs.utc(trip.end_date).format("DD MMM YYYY - HH:mm")}
          </p>
        </Col>
        <Col span={4} style={{ textAlign: "right" }}>
          <p>
            <button
              className="active"
              style={{ width: "24px", border: "none", borderRadius: "5px" }}
            >
              {trip.order_to}
            </button>{" "}
          </p>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
        </Col>
      </Row>
    </Card>
  );
}
