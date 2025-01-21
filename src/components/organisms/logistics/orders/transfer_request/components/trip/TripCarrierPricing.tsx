import { TripCarriersPricing } from "@/types/logistics/schema";
import { Flex, Radio, Space, Typography } from "antd";
import style from "./TripCarrierPricing.module.scss";
import CarrierRequestProposal from "../carrierRequest/CarrierRequestProposal";
import { useState } from "react";
import { CarrierPricingFinish } from "@/types/logistics/transferRequest/transferRequest";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

const { Text, Title } = Typography;

interface intrinsicEntry extends Omit<TripCarriersPricing, "id_trip" | "id_tr_other_requirement"> {
  id: number;
}

type Props = {
  trip: intrinsicEntry;
  // eslint-disable-next-line no-unused-vars
  handleSelectCarrier: (data: CarrierPricingFinish) => void;
  fields: any[];
  entity: "trip" | "otherRequirement";
};
export default function TripCarrierPricing({ trip, handleSelectCarrier, fields, entity }: Props) {
  return (
    <>
      <Flex className={style.dataContainer} justify="space-between">
        <Flex className={style.vehicleDescription} gap={24}>
          <Title level={3} style={{ fontWeight: "bold", margin: 0 }}>
            {trip.vehicle_type_desc}
          </Title>
          <Flex gap={6} vertical>
            <Text>
              <strong>Fecha inicio</strong>
              <>&nbsp;&nbsp;</>
              {dayjs.utc(trip.start_date).toDate().toLocaleDateString("es", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                timeZone: "GMT"
              })}
            </Text>
            <Text>
              <strong>Fecha fin</strong>
              <>&nbsp;&nbsp;</>
              {dayjs.utc(trip.end_date).toDate().toLocaleDateString("es", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                timeZone: "GMT"
              })}
            </Text>
          </Flex>
        </Flex>
        <Flex vertical gap={6} className={style.fromTo} align="end">
          <Text>
            <strong>Origen</strong>
            <>&nbsp;&nbsp;</>
            {trip.start_location_desc}
            <>&nbsp;&nbsp;</>
            {dayjs.utc(trip.start_date).toDate().toLocaleTimeString("es", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "GMT"
            })}
          </Text>
          <Text>
            <strong>Destino</strong>
            <>&nbsp;&nbsp;</>
            {trip.end_location_desc}
            <>&nbsp;&nbsp;</>
            {dayjs.utc(trip.end_date).toDate().toLocaleTimeString("es", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "GMT"
            })}
          </Text>
        </Flex>
      </Flex>
      <Radio.Group
        value={fields.find((a) => a.id_trip === trip.id)?.id_carrier_request}
        onChange={({ target: { value } }) =>
          handleSelectCarrier({
            id_carrier_request: value,
            idEntity: trip.id,
            provider: trip.carriers_pricing.find((a) => a.id === value)?.id_carrier || 0,
            entity
          })
        }
      >
        <Flex vertical gap={24}>
          {trip.carriers_pricing.map((carrier, index) => (
            <CarrierRequestProposal
              key={`proposal-${index}-${trip.id}-${entity}`}
              carrier={carrier}
            />
          ))}
        </Flex>
      </Radio.Group>
    </>
  );
}
