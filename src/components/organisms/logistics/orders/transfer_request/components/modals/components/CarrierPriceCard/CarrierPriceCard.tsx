import React from "react";
import { Checkbox, Flex, Typography } from "antd"; // Assuming Ant Design is used for the Checkbox
import styles from "./CarrierPriceCard.module.scss"; // Custom styles (create a separate SCSS file if needed)

import { Truck } from "phosphor-react"; // Icon library, adjust based on your setup
import { CarriersPricingModal, serviceType } from "@/types/logistics/trips/TripsSchema";
const { Text } = Typography;

// Defining the props interface
interface CarrierPriceCardProps {
  carrier: CarriersPricingModal;
  currentTripId: number | null;
  isChecked: boolean;
  handleCheck: (id_carrier_pricing: number, id_carrier: number, isChecked: boolean) => void;
  type: serviceType;
}

const CarrierPriceCard: React.FC<CarrierPriceCardProps> = ({
  carrier,
  currentTripId,
  isChecked,
  handleCheck,
  type
}) => {
  if (!currentTripId) return <></>;
  return (
    <Flex
      className={styles.checks}
      justify="space-between"
      gap={24}
      key={`carrier-${carrier.id_carrier_pricing}-${currentTripId}`}
    >
      <Flex align="center" gap={8} justify="center">
        <Checkbox
          id={`checkbox-${carrier.id_carrier_pricing}-${currentTripId}`}
          checked={isChecked}
          onChange={() => handleCheck(carrier.id_carrier_pricing, carrier.id_carrier, isChecked)}
        />
        <label htmlFor={`checkbox-${carrier.id_carrier_pricing}-${currentTripId}`}>
          <Flex vertical style={{ cursor: "pointer" }}>
            <Text
              style={{ fontWeight: "600", fontSize: "1rem" }}
              id={`description-${currentTripId}`}
            >
              {carrier.description}
            </Text>
            <Text
              style={{ fontSize: "1rem", fontWeight: "500", color: "#666666" }}
              id={`fee_description-${currentTripId}`}
            >
              {carrier.fee_description}
            </Text>
          </Flex>
        </label>
      </Flex>
      <Flex vertical align="end" justify="center">
        <Text style={{ fontSize: "1.2rem" }}>${carrier.price?.toLocaleString("es-CO")}</Text>
        {type === "other_requirement" && carrier.pricing_description ? (
          <Text>{carrier.pricing_description}</Text>
        ) : (
          <Text style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {carrier.disponibility} <Truck size={16} weight="fill" />
          </Text>
        )}
      </Flex>
    </Flex>
  );
};

export default CarrierPriceCard;
