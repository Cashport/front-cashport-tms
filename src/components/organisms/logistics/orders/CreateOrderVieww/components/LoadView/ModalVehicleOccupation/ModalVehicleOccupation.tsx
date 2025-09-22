import React from "react";
import { Flex, Modal } from "antd";
import { Barbell, CubeTransparent } from "@phosphor-icons/react";

import { IVehicleWithOccupation } from "@/types/logistics/schema";

import "./modalVehicleOccupation.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOk?: () => void;
  selectedVehiclesInfo?: IVehicleWithOccupation[];
}
export const ModalVehicleOccupation = ({ isOpen, onClose, onOk, selectedVehiclesInfo }: Props) => {
  const refinedVehicles = selectedVehiclesInfo?.map((vehicle) => ({
    description: vehicle.description,
    id: vehicle.id,
    ocupationKg: vehicle.ocupationKg,
    ocupationM3: vehicle.ocupationM3,
    ocupationPassengers: vehicle.ocupationPassengers
  }));

  const vehiclesWithLowOccupation = refinedVehicles?.filter(
    (vehicle) =>
      (vehicle.ocupationKg && vehicle.ocupationKg <= 50) ||
      (vehicle.ocupationM3 && vehicle.ocupationM3 <= 50)
  );

  return (
    <Modal
      className="modalVehicleOccupation"
      width={686}
      open={isOpen}
      onCancel={onClose}
      okButtonProps={{ className: "acceptButton" }}
      okText="Sí, continuar"
      cancelButtonProps={{
        className: "cancelButton"
      }}
      cancelText="No, cambiar de vehículo"
      title="Carga"
      onOk={onOk}
    >
      <Flex vertical align="center" gap={"1.5rem"} className="modalVehicleOccupation">
        <Flex vertical align="center" gap={"1.5rem"}>
          <h3 className="modalVehicleOccupation__title">
            La ocupación de
            {vehiclesWithLowOccupation && vehiclesWithLowOccupation.length > 1
              ? " los vehículos seleccionados"
              : "l vehículo seleccionado"}{" "}
            es demasiado baja
          </h3>

          <Flex vertical gap={"1rem"}>
            {vehiclesWithLowOccupation?.map((vehicle) => (
              <Flex key={vehicle.id} vertical gap={"0.5rem"}>
                <p className="modalVehicleOccupation__vehicleDescription">{vehicle.description}</p>
                <Flex className="modalVehicleOccupation__occupationByVehicle" gap={"1rem"}>
                  {vehicle.ocupationKg && vehicle.ocupationKg <= 50 && (
                    <Flex className="occupationCard" justify="space-between" align="center">
                      <Flex vertical>
                        <p className="occupationCard__label">PESO</p>
                        <h4 className="occupationCard__value">{vehicle.ocupationKg}%</h4>
                      </Flex>
                      <Barbell size={32} color="#FF9947" weight="duotone" />
                    </Flex>
                  )}
                  {vehicle.ocupationM3 && vehicle.ocupationM3 <= 50 && (
                    <Flex className="occupationCard" justify="space-between" align="center">
                      <Flex vertical>
                        <p className="occupationCard__label">VOLUMEN</p>
                        <h4 className="occupationCard__value">{vehicle.ocupationM3}%</h4>
                      </Flex>
                      <CubeTransparent size={32} color="#FF9947" weight="duotone" />
                    </Flex>
                  )}
                </Flex>
              </Flex>
            ))}
          </Flex>

          <p className="modalVehicleOccupation__description">
            Esto podría generar costos adicionales en el transporte de tu carga. ¿Quieres continuar?
          </p>
        </Flex>
      </Flex>
    </Modal>
  );
};
