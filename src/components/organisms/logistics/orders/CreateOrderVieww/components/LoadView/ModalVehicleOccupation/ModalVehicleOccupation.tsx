import React from "react";
import { Flex, Modal } from "antd";
import { Barbell, CubeTransparent } from "@phosphor-icons/react";

import "./modalVehicleOccupation.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOk?: () => void;
}
export const ModalVehicleOccupation = ({ isOpen, onClose, onOk }: Props) => {
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
            La ocupación del vehículo seleccionado es demasiado baja
          </h3>

          <Flex gap={"1rem"}>
            <Flex className="occupationCard" justify="space-between" align="center">
              <Flex vertical>
                <p className="occupationCard__label">PESO</p>
                <h4 className="occupationCard__value">20%</h4>
              </Flex>
              <Barbell size={32} color="#FF9947" weight="duotone" />
            </Flex>
            <Flex className="occupationCard" justify="space-between" align="center">
              <Flex vertical>
                <p className="occupationCard__label">VOLUMEN</p>
                <h4 className="occupationCard__value">20%</h4>
              </Flex>
              <CubeTransparent size={32} color="#FF9947" weight="duotone" />
            </Flex>
          </Flex>

          <p className="modalVehicleOccupation__description">
            Esto podría generar costos adicionales en el transporte de tu carga. ¿Quieres continuar?
          </p>
        </Flex>
      </Flex>
    </Modal>
  );
};
