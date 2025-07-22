import React from "react";
import Image from "next/image";
import dayjs from "dayjs";
import "dayjs/locale/es"; // Importar locale español
import utc from "dayjs/plugin/utc";
import { Button, Dropdown, Flex, MenuProps, Tooltip } from "antd";
import {
  CaretCircleDoubleUp,
  CaretDown,
  Copy,
  HandPalm,
  Phone,
  Star,
  Truck
} from "@phosphor-icons/react";

import Container from "@/components/atoms/Container/Container";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";

import "./createTOMilkyView.scss";

// Configurar plugins
dayjs.extend(utc);
dayjs.locale("es");

const CreateTOMilkyView: React.FC = () => {
  const handleCopyDriverPhone = (driverPhone: string) => {
    navigator.clipboard.writeText(driverPhone);
  };
  return (
    <Container>
      <div className="createTOMilkyView">
        <div className="createTOMilkyView__descriptionCard">
          <Flex vertical gap={"1rem"} style={{ maxWidth: "575px" }}>
            <h3>Flota dedicada</h3>
            <h5>Identificamos vehículos con capacidad disponible en la ruta de tu carga.</h5>
            <p>
              “Al compartir el transporte con otros envíos, puedes optimizar recursos, ahorrar en
              costos logísticos y acelerar los tiempos de entrega.”
            </p>
          </Flex>

          <Image
            src="/images/logistics/createTODescriptionImage.png"
            alt="Create TO Description"
            width={595}
            height={250}
          />
        </div>

        <Flex vertical gap={"1.5rem"}>
          {mockRoutes.map((route) => {
            const stopsItems: MenuProps["items"] = route?.stops?.map((stop, i) => ({
              key: stop.id,
              label: (
                <>
                  <div
                    className="stopItem"
                    style={{
                      borderBottom: i === route.stops.length - 1 ? "none" : "1px solid #DDDDDD",
                      paddingBottom: i === route.stops.length - 1 ? 0 : "0.5rem"
                    }}
                  >
                    <p>
                      {i + 1}. {stop.name} <span>({stop.cityName})</span>
                    </p>

                    <p>{dayjs(stop.time).format("MMM DD - HH:mm")}</p>
                  </div>
                </>
              )
            }));
            return (
              <div key={route.id} className="createTOMilkyView__recommendationTripCard">
                <Flex
                  className="createTOMilkyView__recommendationTripCard__header"
                  gap={"1rem"}
                  align="center"
                  justify="space-between"
                >
                  <Flex gap={"0.75rem"} align="center">
                    <Image
                      src={route.companyInfo.companyLogo}
                      alt={route.companyInfo.companyName}
                      width={50}
                      height={50}
                    />
                    <Flex vertical>
                      <h6>{route.tripDescription}</h6>
                      <p>{route.companyInfo.companyName}</p>
                    </Flex>
                  </Flex>

                  <Flex gap={"1.25rem"} align="center">
                    {route.isRecommended && (
                      <Flex gap={"0.5rem"} align="center">
                        <Star size={12} />
                        <p>Recomendado</p>
                      </Flex>
                    )}

                    {route.dedicatedFleet && (
                      <Flex gap={"0.5rem"} align="center">
                        <CaretCircleDoubleUp size={12} />
                        <p>Flota dedicada</p>
                      </Flex>
                    )}

                    {route.driversInfo && (
                      <Tooltip
                        className="driver-info-tooltip"
                        title={
                          <Flex
                            gap={"1rem"}
                            align="center"
                            className="driver-info-tooltip-hoverMessage"
                          >
                            <p className="driver-phone">{route.driversInfo.driverPhone}</p>
                            <Button
                              onClick={() => handleCopyDriverPhone(route.driversInfo.driverPhone)}
                              className="copyButton"
                            >
                              <Copy size={16} />
                            </Button>
                          </Flex>
                        }
                        color="#ffffff"
                      >
                        <Phone size={12} />
                        <p className="driver-name">{route.driversInfo.driverName}</p>
                      </Tooltip>
                    )}
                  </Flex>
                </Flex>

                <div className="createTOMilkyView__recommendationTripCard__content">
                  <Flex gap={"1.5rem"} justify="space-between">
                    <Flex vertical gap={"0.5rem"}>
                      <p className="date">
                        {dayjs(route.tripInfo.originTime).format("D MMM YYYY")}
                      </p>
                      <h5 className="time">{dayjs(route.tripInfo.originTime).format("HH:mm")}</h5>
                      <p className="origin">
                        {route.tripInfo.origin} <span>({route.tripInfo.originCity})</span>
                      </p>
                    </Flex>
                    <Flex vertical gap={"0.5rem"} align="center" style={{ flexGrow: 1 }}>
                      <span className="hhmmDuration">38h 45m</span>
                      <Flex style={{ width: "100%" }} align="center">
                        <Truck size={24} />
                        <span className="durationLine" />
                      </Flex>

                      {stopsItems && stopsItems.length > 0 && (
                        <Dropdown menu={{ items: stopsItems }} placement="bottom">
                          <Button>
                            <HandPalm size={16} />
                            Paradas {stopsItems.length}
                            <CaretDown size={16} />
                          </Button>
                        </Dropdown>
                      )}
                    </Flex>

                    <Flex vertical gap={"0.5rem"}>
                      <p className="date">
                        {dayjs(route.tripInfo.destinationTime).format("D MMM YYYY")}
                      </p>
                      <h5 className="time">
                        {dayjs(route.tripInfo.destinationTime).format("HH:mm")}
                      </h5>
                      <p className="origin">
                        {route.tripInfo.destination} <span>({route.tripInfo.destinationCity})</span>
                      </p>
                    </Flex>
                  </Flex>

                  <Flex vertical gap={"0.5rem"} align="center" justify="center">
                    <PrincipalButton
                      style={{ width: "151px", height: "45px" }}
                      className="selectRouteButton"
                    >
                      Seleccionar ruta
                    </PrincipalButton>
                  </Flex>
                </div>
              </div>
            );
          })}
        </Flex>
      </div>
    </Container>
  );
};

export default CreateTOMilkyView;

const mockCurrentUserLoad = 25;

const mockRoutes = [
  {
    id: "1",
    tripDescription: "C-350",
    companyInfo: {
      companyName: "ColTanques asasassa",
      companyLogo: "https://picsum.photos/50/50"
    },
    isRecommended: true,
    dedicatedFleet: true,
    driversInfo: {
      driverName: "Juan Pablo Pérez",
      driverPhone: "+1234567890"
    },
    discount: 60,
    usedPercentage: 41,
    tripInfo: {
      origin: "Barrio A",
      originCity: "Ciudad A",
      originTime: "2023-10-01T08:00:00Z",
      destination: "Barrio B",
      destinationCity: "Ciudad B",
      destinationTime: "2023-10-01T10:00:00Z",
      duration: 84600000 // 23.5 hours in milliseconds
    },
    stops: [
      {
        id: "1",
        name: "Parada 1",
        cityName: "Ciudad Q",
        time: "2023-10-01T09:00:00Z"
      },
      {
        id: "2",
        name: "Parada 2",
        cityName: "Ciudad H",
        time: "2023-10-01T11:30:00Z"
      }
    ]
  },
  {
    id: "2",
    tripDescription: "C-360",
    companyInfo: {
      companyName: "ColTanques",
      companyLogo: "https://picsum.photos/50/50"
    },
    isRecommended: false,
    dedicatedFleet: false,
    driversInfo: {
      driverName: "Ana María López",
      driverPhone: "+0987654321"
    },
    discount: 0,
    usedPercentage: 30,
    tripInfo: {
      origin: "Barrio C",
      originCity: "Ciudad C",
      originTime: "2023-10-01T07:00:00Z",
      destination: "Barrio D",
      destinationCity: "Ciudad D",
      destinationTime: "2023-10-01T09:00:00Z",
      duration: 72000000 // 20 hours in milliseconds
    }
  }
];
