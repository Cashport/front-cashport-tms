import React from "react";
import { Checkbox, Flex, Typography } from "antd";
import { Star, Truck } from "@phosphor-icons/react";
import styles from "./CarrierPriceCard.module.scss";

import {
  CarriersPricingModal,
  JourneyTripPricing,
  serviceType
} from "@/types/logistics/trips/TripsSchema";
import CommunityTag from "../../../communityTag/communityTag";

const { Text } = Typography;

interface CarrierPriceCardProps {
  carrier: CarriersPricingModal;
  currentTripId: number | null;
  isChecked: boolean;
  handleCheck: (id_carrier_pricing: number, id_carrier: number, isChecked: boolean) => void;
  type: serviceType;
  journey: Omit<JourneyTripPricing, "trips" | "other_requirements">;
}

const CarrierPriceCard: React.FC<CarrierPriceCardProps> = ({
  carrier,
  currentTripId,
  isChecked,
  handleCheck,
  type,
  journey
}) => {
  if (!currentTripId) return <></>;

  // Obtener las comunidades del journey
  const journeyCommunities = [
    journey.start_group_location_desc,
    journey.end_group_location_desc
  ].filter(Boolean); // Filtrar valores null/undefined

  // Parsear las comunidades del carrier
  const carrierCommunities = carrier.communities
    ? carrier.communities
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : []; // Si no hay communities, usar array vacío

  // Encontrar la comunidad que coincide
  let isCommunityCarrier: string | null = null;

  for (const carrierCommunity of carrierCommunities) {
    for (const journeyCommunity of journeyCommunities) {
      if (carrierCommunity?.toLowerCase() === journeyCommunity?.toLowerCase()) {
        isCommunityCarrier = carrierCommunity; // Guardar el nombre de la comunidad que coincide
        break;
      }
    }
    if (isCommunityCarrier) break;
  }

  return (
    <div className={styles.checks} key={`carrier-${carrier.id_carrier_pricing}-${currentTripId}`}>
      <Flex align="center" gap={8} justify="center">
        <Checkbox
          id={`checkbox-${carrier.id_carrier_pricing}-${currentTripId}`}
          checked={isChecked}
          onChange={() => handleCheck(carrier.id_carrier_pricing, carrier.id_carrier, isChecked)}
        />
        <label htmlFor={`checkbox-${carrier.id_carrier_pricing}-${currentTripId}`}>
          <Flex vertical style={{ cursor: "pointer" }}>
            <Text
              style={{ fontWeight: "600", fontSize: "1rem", maxWidth: "440px" }}
              id={`description-${currentTripId}`}
              ellipsis={{ tooltip: false }}
            >
              {carrier.description}
            </Text>
            <Flex gap={"12px"} align="center">
              <Text
                style={{ fontSize: "1rem", fontWeight: "500", color: "#666666" }}
                id={`fee_description-${currentTripId}`}
              >
                {carrier.fee_description}
              </Text>
              {/* Mostrar el nombre de la comunidad si hay match */}
              {isCommunityCarrier && <CommunityTag name={isCommunityCarrier} />}
            </Flex>
          </Flex>
        </label>
      </Flex>
      <Flex vertical align="end" justify="center" gap={"0.2rem"}>
        {/* {carrier.isBest && (
          <Flex align="center" gap={4} style={{ marginBottom: "0.5rem" }}>
            <Star size={16} />
            <Text style={{ fontSize: "0.75rem" }}>Recomendada</Text>
          </Flex>
        )} */}
        <Text style={{ fontSize: "1.2rem" }}>${carrier.price?.toLocaleString("es-CO")}</Text>
        {type === "other_requirement" && carrier.pricing_description ? (
          <Text>{carrier.pricing_description}</Text>
        ) : (
          <Text style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {carrier.disponibility} <Truck size={16} weight="fill" />
          </Text>
        )}
      </Flex>
    </div>
  );
};

export default CarrierPriceCard;
