import React from "react";
import { Flex } from "antd";
import { CalendarDots, Clock, Path } from "@phosphor-icons/react";

import { getTravelDuration } from "@/utils/logistics/maps";

import "./summaryCard.scss";

interface ISummaryCardProps {
  distance?: number; // in meters
  duration?: number; // in seconds, optional for now
  selectedTripType?: "1" | "2" | "3";
  durationBasedOnSelects?: {
    days: number;
    hours: number;
  };
  isFixRate?: boolean;
}

const SummaryCard: React.FC<ISummaryCardProps> = ({
  distance,
  duration,
  selectedTripType,
  durationBasedOnSelects,
  isFixRate
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
        {isFixRate ? (
          <Flex className="summaryCard__item">
            <CalendarDots className="summaryCard__icon" size={32} />
            <Flex vertical>
              <p>Tiempo de renta</p>
              <strong>{days > 0 ? `${days} días` : `${rentingHours} horas`}</strong>
            </Flex>
          </Flex>
        ) : selectedTripType === "2" ? (
          <Flex className="summaryCard__item">
            <Path className="summaryCard__icon" size={32} />
            <Flex vertical>
              <p>Tiempo de izaje</p>
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
