import React from "react";
import { Flex, Button, Dropdown, MenuProps, Progress } from "antd";
import dayjs from "dayjs";
import { CaretDown, HandPalm, Truck, Eye } from "@phosphor-icons/react";

interface Stop {
  id: string;
  name: string;
  cityName: string;
  time: string;
}

interface TripInfoProps {
  tripInfo: {
    origin: string;
    originCity: string;
    originTime: string;
    destination: string;
    destinationCity: string;
    destinationTime: string;
  };
  stops?: Stop[];
  currentUserLoad: number;
  onSeeLoad: () => void;
}

export const TripInfo: React.FC<TripInfoProps> = ({
  tripInfo,
  stops = [],
  currentUserLoad,
  onSeeLoad
}) => {
  const stopsItems: MenuProps["items"] = stops.map((stop, i) => ({
    key: stop.id,
    label: (
      <div
        className="stopItem"
        style={{
          borderBottom: i === stops.length - 1 ? "none" : "1px solid #DDDDDD",
          paddingBottom: i === stops.length - 1 ? 0 : "0.5rem"
        }}
      >
        <p>
          {i + 1}. {stop.name} <span>({stop.cityName})</span>
        </p>
        <p>{dayjs(stop.time).format("MMM DD - HH:mm")}</p>
      </div>
    )
  }));

  return (
    <Flex vertical>
      {/* STOPS AND TRIP INFO */}
      <Flex gap={"1.5rem"} justify="space-between" className="tripInfo">
        <Flex vertical gap={"0.5rem"}>
          <p className="date">{dayjs(tripInfo.originTime).format("D MMM YYYY")}</p>
          <h5 className="time">{dayjs(tripInfo.originTime).format("HH:mm")}</h5>
          <p className="origin">
            {tripInfo.origin} <span>({tripInfo.originCity})</span>
          </p>
        </Flex>

        <Flex vertical gap={"0.5rem"} align="center" style={{ flexGrow: 1 }}>
          <span className="hhmmDuration">38h 45m</span>
          <Flex style={{ width: "100%" }} align="center">
            <Truck size={24} className="truckIcon" weight="fill" />
            <span className="durationLine" />
          </Flex>

          {stopsItems.length > 0 && (
            <Dropdown menu={{ items: stopsItems }} placement="bottom">
              <Button style={{ boxShadow: "none" }}>
                <HandPalm size={16} />
                Paradas {stopsItems.length}
                <CaretDown size={16} />
              </Button>
            </Dropdown>
          )}
        </Flex>

        <Flex vertical gap={"0.5rem"} align="end">
          <p className="date">{dayjs(tripInfo.destinationTime).format("D MMM YYYY")}</p>
          <h5 className="time">{dayjs(tripInfo.destinationTime).format("HH:mm")}</h5>
          <p className="origin">
            {tripInfo.destination} <span>({tripInfo.destinationCity})</span>
          </p>
        </Flex>
      </Flex>

      {/* LOAD INFO */}
      <Flex vertical className="loadInfo" gap={"1rem"}>
        <Progress
          percent={60}
          success={{ percent: currentUserLoad }}
          showInfo={false}
          className="custom-progress"
          size={{ height: 10 }}
        />

        <Flex align="center" justify="space-between">
          <Flex gap={"1.5rem"}>
            <Flex gap={"0.5rem"} align="center">
              <span className="progressCircleInfo" style={{ backgroundColor: "#f2ffa2 " }} />
              <p>Carga actual</p>
            </Flex>

            <Flex gap={"0.5rem"} align="center">
              <span
                className="progressCircleInfo"
                style={{
                  backgroundColor: "#cbe71e"
                }}
              />
              <p>Tu carga</p>
            </Flex>

            <Flex gap={"0.5rem"} align="center">
              <span className="progressCircleInfo" />
              <p>Disponible</p>
            </Flex>
          </Flex>

          <Flex gap={"1rem"}>
            <button className="viewLoadButton" onClick={onSeeLoad}>
              Ver carga <Eye size={"16"} />
            </button>

            <p className="loadUsage">
              Utilización <span>{currentUserLoad}%</span>
            </p>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
