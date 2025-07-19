import React from "react";
import Image from "next/image";
import { Flex } from "antd";
import { CaretCircleDoubleUp, Star } from "@phosphor-icons/react";

import Container from "@/components/atoms/Container/Container";

import "./createTOMilkyView.scss";

const CreateTOMilkyView: React.FC = () => {
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
          {mockRoutes.map((route) => (
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
                </Flex>
              </Flex>
            </div>
          ))}
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
