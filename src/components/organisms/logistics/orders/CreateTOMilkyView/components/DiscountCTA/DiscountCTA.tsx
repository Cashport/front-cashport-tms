import React from "react";
import { Flex } from "antd";
import { Tag } from "@phosphor-icons/react";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";

interface DiscountCTAProps {
  discountPercentage?: number;
  onSelectRoute: () => void;
}

export const DiscountCTA: React.FC<DiscountCTAProps> = ({ discountPercentage, onSelectRoute }) => {
  return (
    <Flex vertical gap={"0.5rem"} align="center" justify="space-between">
      {discountPercentage && (
        <Flex justify="space-between" style={{ width: "100%" }}>
          <Flex vertical>
            <p
              style={{
                fontSize: "0.625rem",
                fontWeight: 400
              }}
            >
              AHORRA HASTA
            </p>
            <span
              style={{
                fontSize: "1.25rem",
                fontWeight: 700
              }}
            >
              -{discountPercentage}%
            </span>
          </Flex>

          <Tag size={32} color="#ff9947" weight="duotone" />
        </Flex>
      )}

      <SecondaryButton className="selectRouteButton" onClick={onSelectRoute}>
        Seleccionar ruta
      </SecondaryButton>
    </Flex>
  );
};
