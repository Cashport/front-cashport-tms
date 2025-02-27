import { Modal, Flex, Typography, ConfigProvider, Dropdown, Input, MenuProps } from "antd";
import Link from "next/link";
import styles from "./ModalVehicleFollowUp.module.scss"; // Ajusta según tu estructura
import FooterButtons from "../../../ModalBillingAction/FooterButtons/FooterButtons";
import { VehicleTracking } from "@/types/logistics/tracking/tracking";
import ModalHeader from "../ModalHeader";
import { TransferOrdersState } from "@/utils/constants/transferOrdersState";
import { STATUS } from "@/utils/constants/globalConstants";

const { Text } = Typography;
const { TextArea } = Input;

interface ModalVehicleFollowUpProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeStatus: (status: string) => void;
  currentVehicle: VehicleTracking | null;
  comments: string;
  setComments: (value: string) => void;
  dropdownItems: { key: string; label: string }[];
  getStateDropdown: (stateId: string) => React.ReactNode;
}

export const ModalVehicleFollowUp: React.FC<ModalVehicleFollowUpProps> = ({
  isOpen,
  onClose,
  onChangeStatus,
  currentVehicle,
  comments,
  setComments,
  dropdownItems,
  getStateDropdown
}) => {
  const items: MenuProps["items"] = [
    {
      key: "0f7cccf5-1764-44c6-bb2a-874f419bc8f1",
      label: "Cargando"
    },
    {
      key: "b9e5ce08-16a7-4880-88a5-ebca7737c55d",
      label: "En curso"
    },
    {
      key: "780fa2f9-1b89-4d92-83dc-52de4c932056",
      label: "Descargando"
    },
    {
      key: "9f37afd7-1852-457d-964b-378fa6150471",
      label: "Detenido"
    },
    {
      key: "73ad61e3-395f-4ae4-8aef-9d24f3f917a9",
      label: "Stand by"
    }
  ];
  return (
    <Modal
      open={isOpen}
      centered
      onCancel={onClose}
      title={<Text style={{ fontWeight: 600, fontSize: 20 }}>Seguimiento vehículo</Text>}
      footer={
        <FooterButtons
          titleConfirm="Cambiar de estado"
          onClose={onClose}
          handleOk={() => onChangeStatus(currentVehicle?.state_id || "")}
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
                defaultSelectedKeys: [currentVehicle?.state_id || ""],
                onClick: (item) => onChangeStatus(item.key)
              }}
            >
              {getStateDropdown(currentVehicle?.state_id || "")}
            </Dropdown>
          </ConfigProvider>
        </Flex>

        <Flex vertical gap={8}>
          <p className={styles.comments}>Observación</p>
          <TextArea
            placeholder="Observación"
            value={comments}
            autoSize={{ minRows: 2, maxRows: 4 }}
            onChange={(event) => setComments(event.target.value)}
            style={{ backgroundColor: "#F7F7F7", border: "none" }}
          />
        </Flex>
      </Flex>
    </Modal>
  );
};
