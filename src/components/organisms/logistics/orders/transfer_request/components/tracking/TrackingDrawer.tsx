import { ITrackingResponse } from "@/types/logistics/schema";
import { Card, Col, Row } from "antd";
import { DotsSixVertical } from "phosphor-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export default function TrackingDrawer({
  trip,
  hasError
}: {
  trip: ITrackingResponse;
  hasError: boolean;
}) {
  return (
    <>
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
            <p>{trip.type_service_desc}</p>
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
    </>
  );
}
