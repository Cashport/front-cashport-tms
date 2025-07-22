import React from "react";
import Image from "next/image";
import { Flex, Tooltip, Button } from "antd";
import { CaretCircleDoubleUp, Copy, Phone, Star } from "@phosphor-icons/react";

interface RouteCardHeaderProps {
  companyLogo: string;
  companyName: string;
  tripDescription: string;
  isRecommended?: boolean;
  dedicatedFleet?: boolean;
  driversInfo?: {
    driverName: string;
    driverPhone: string;
  };
}

export const RouteCardHeader: React.FC<RouteCardHeaderProps> = ({
  companyLogo,
  companyName,
  tripDescription,
  isRecommended,
  dedicatedFleet,
  driversInfo
}) => {
  const handleCopyDriverPhone = (driverPhone: string) => {
    navigator.clipboard.writeText(driverPhone);
  };

  return (
    <Flex
      className="createTOMilkyView__recommendationTripCard__header"
      gap={"1rem"}
      align="center"
      justify="space-between"
    >
      <Flex gap={"0.75rem"} align="center">
        <Image src={companyLogo} alt={companyName} width={50} height={50} />
        <Flex vertical>
          <h6>{tripDescription}</h6>
          <p>{companyName}</p>
        </Flex>
      </Flex>

      <Flex gap={"1.25rem"} align="center">
        {isRecommended && (
          <Flex gap={"0.5rem"} align="center">
            <Star size={12} />
            <p>Recomendado</p>
          </Flex>
        )}

        {dedicatedFleet && (
          <Flex gap={"0.5rem"} align="center">
            <CaretCircleDoubleUp size={12} />
            <p>Flota dedicada</p>
          </Flex>
        )}

        {driversInfo && (
          <Tooltip
            className="driver-info-tooltip"
            title={
              <Flex gap={"1rem"} align="center" className="driver-info-tooltip-hoverMessage">
                <p className="driver-phone">{driversInfo.driverPhone}</p>
                <Button
                  onClick={() => handleCopyDriverPhone(driversInfo.driverPhone)}
                  className="copyButton"
                >
                  <Copy size={16} />
                </Button>
              </Flex>
            }
            color="#ffffff"
          >
            <Phone size={12} />
            <p className="driver-name">{driversInfo.driverName}</p>
          </Tooltip>
        )}
      </Flex>
    </Flex>
  );
};
