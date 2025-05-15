import { useEffect } from "react";
import { Modal, Flex, Typography, ConfigProvider, Dropdown, Input, MenuProps } from "antd";

import { TransferOrdersState } from "@/utils/constants/transferOrdersState";
import { TransferOrdersTripState } from "@/utils/constants/transferOrdersState";
import { STATUS } from "@/utils/constants/globalConstants";

import FooterButtons from "../../../ModalBillingAction/FooterButtons/FooterButtons";
import ModalHeader from "../ModalHeader";

import { VehicleTracking } from "@/types/logistics/tracking/tracking";

import styles from "./ModalVehicleFollowUp.module.scss"; // Ajusta según tu estructura

const { Text } = Typography;
const { TextArea } = Input;

interface ModalVehicleFollowUpProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeStatus: (status: string) => void;
  currentVehicle: VehicleTracking | null;
  comment: string;
  setComment: (value: string) => void;
  dropdownItems: { key: string; label: string }[];
  getStateDropdown: (stateId: string) => React.ReactNode;
  onConfirm: () => void;
  isLoading: boolean;
  tripStatus: string;
}

export const ModalVehicleFollowUp: React.FC<ModalVehicleFollowUpProps> = ({
  isOpen,
  onClose,
  onChangeStatus,
  currentVehicle,
  comment,
  setComment,
  dropdownItems,
  getStateDropdown,
  onConfirm,
  isLoading,
  tripStatus
}) => {
  const items: MenuProps["items"] = TransferOrdersTripState.map((item) => ({
    key: item.id,
    label: item.name
  }));

  useEffect(() => {
    if (isOpen) {
      setComment("");
      onChangeStatus(currentVehicle?.state_id ?? "");
    }
  }, [isOpen]);

  return (
    <Modal
      open={isOpen}
      centered
      onCancel={onClose}
      title={<Text style={{ fontWeight: 600, fontSize: 20 }}>Seguimiento vehículo</Text>}
      footer={
        <FooterButtons
          titleConfirm="Guardar"
          onClose={onClose}
          handleOk={onConfirm}
          isConfirmLoading={isLoading}
          isConfirmDisabled={isLoading || comment.length === 0}
        />
      }
    >
      <Flex vertical gap={22}>
        <ModalHeader
          vehicle={currentVehicle}
          transferOrderStates={TransferOrdersState}
          defaultStateId={STATUS.TR.SIN_INICIAR}
          showState={false}
        />
        <Flex justify="space-between" align="center">
          <Text style={{ fontWeight: 600, fontSize: 20 }}>Estado del viaje </Text>
          <ConfigProvider
            theme={{
              components: {
                Dropdown: {
                  colorBgElevated: "#FFFFFF",
                  controlItemBgActive: "#CBE71E",
                  controlItemBgActiveHover: "#CBE71E"
                }
              }
            }}
          >
            <Dropdown
              overlayClassName={styles.overlayDropDown}
              menu={{
                items,
                selectable: true,
                defaultSelectedKeys: [tripStatus || ""],
                onClick: (item) => onChangeStatus(item.key)
              }}
            >
              {getStateDropdown(tripStatus)}
            </Dropdown>
          </ConfigProvider>
        </Flex>

        <Flex vertical gap={8}>
          <p className={styles.comments}>Observación</p>
          <TextArea
            placeholder="Observación"
            value={comment}
            autoSize={{ minRows: 2, maxRows: 4 }}
            onChange={(event) => setComment(event.target.value)}
            style={{ backgroundColor: "#F7F7F7", border: "none" }}
          />
        </Flex>
      </Flex>
    </Modal>
  );
};
