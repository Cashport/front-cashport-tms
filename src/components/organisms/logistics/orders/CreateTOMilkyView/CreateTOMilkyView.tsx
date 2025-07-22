import React from "react";
import Image from "next/image";
import dayjs from "dayjs";
import "dayjs/locale/es"; // Importar locale español
import utc from "dayjs/plugin/utc";
import { Flex } from "antd";

import Container from "@/components/atoms/Container/Container";
import RouteCard from "./components/RouteCard/RouteCard";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import ModalLoadDetails from "./components/ModalLoadDetails/ModalLoadDetails";

import "./createTOMilkyView.scss";

// Configurar plugins
dayjs.extend(utc);
dayjs.locale("es");

const CreateTOMilkyView: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const handleSeeLoad = () => {
    // Lógica para ver la carga
    setIsModalOpen(true);
  };

  const handleSelectRoute = (routeId: string) => {
    // Lógica para seleccionar la ruta
    console.info(`Ruta seleccionada: ${routeId}`);
  };
  return (
    <>
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

          {mockRoutes.map((route) => (
            <RouteCard
              key={route.id}
              recommendationData={route}
              currentUserLoad={mockCurrentUserLoad}
              onSelectRoute={() => handleSelectRoute(route.id)}
              onSeeLoad={handleSeeLoad}
            />
          ))}

          <PrincipalButton className="createTOMilkyView__footerButton">
            Seleccionar ruta
          </PrincipalButton>
        </div>
      </Container>
      <ModalLoadDetails isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
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
    discountPercentage: 20,
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
