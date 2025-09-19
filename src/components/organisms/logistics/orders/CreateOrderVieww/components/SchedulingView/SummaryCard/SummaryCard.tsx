import React from "react";
import { Flex } from "antd";
import { Clock, Path } from "@phosphor-icons/react";

import { getTravelDuration } from "@/utils/logistics/maps";

import "./summaryCard.scss";

interface ISummaryCardProps {
  distance?: number; // in meters
  duration?: number; // in seconds, optional for now
  selectedTripType?: string;
  durationBasedOnSelects?: {
    days: number;
    hours: number;
  };
}

const SummaryCard: React.FC<ISummaryCardProps> = ({
  distance,
  duration,
  selectedTripType,
  durationBasedOnSelects
}) => {
  const hours = getTravelDuration(duration ?? 0);

  const { days, hours: rentingHours } = durationBasedOnSelects ?? {
    days: 0,
    hours: 0
  };

  return (
    <div className="summaryCard">
      <h2>Resumen del servicio</h2>
      <Flex gap={"1rem"}>
        {selectedTripType === "2" || selectedTripType === "4" ? (
          <Flex className="summaryCard__item">
            <Path className="summaryCard__icon" size={32} />
            <Flex vertical>
              <p>{selectedTripType === "2" ? "Tiempo de izaje" : "Tiempo de renta"}</p>
              <strong>{days > 0 ? `${days} días` : `${rentingHours} horas`}</strong>
            </Flex>
          </Flex>
        ) : (
          <>
            <Flex className="summaryCard__item">
              <Path className="summaryCard__icon" size={32} />
              <Flex vertical>
                <p>Distancia total</p>
                <strong> {distance ? parseFloat((distance / 1000).toFixed(2)) : 0} Km</strong>
              </Flex>
            </Flex>

            <Flex className="summaryCard__item">
              <Clock className="summaryCard__icon" size={32} />
              <Flex vertical>
                <p>Tiempo de desplazamiento</p>
                <strong>{hours} Hrs</strong>
              </Flex>
            </Flex>
          </>
        )}
      </Flex>
    </div>
  );
};

export default SummaryCard;
