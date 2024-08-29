import { Dispatch, SetStateAction } from "react";
import { Flex } from "antd";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { ArrowsClockwise, MapPinLine, MinusCircle } from "phosphor-react";
import { ViewEnum } from "../ModalGenerateActionTO";
import { Gavel } from "@phosphor-icons/react";

const ActionList = ({
  setSelectedView,
  canPreauthorize
}: {
  setSelectedView: Dispatch<SetStateAction<ViewEnum>>;
  canPreauthorize: boolean;
}) => {
  return (
    <Flex style={{ width: "100%", height: "100%" }} gap={12} vertical>
      <ButtonGenerateAction
        disabled={true}
        icon={<MapPinLine size={20} />}
        title="Finalización de viaje"
        onClick={() => setSelectedView(ViewEnum.FINALIZE_TRIP)}
      />
      <ButtonGenerateAction
        disabled={true}
        icon={<ArrowsClockwise size={20} />}
        title="Cambio de proveedor o vehículo"
        onClick={() => setSelectedView(ViewEnum.CHANGE_CARRIER_VEHICLE)}
      />
      <ButtonGenerateAction
        disabled={true}
        icon={<MinusCircle size={20} />}
        title="Cancelación del TR"
        onClick={() => setSelectedView(ViewEnum.CANCEL_TR)}
      />
      <ButtonGenerateAction
        disabled={true}
        icon={<ArrowsClockwise size={20} />}
        title="Modificar solicitud"
        onClick={() => setSelectedView(ViewEnum.MODIFY_REQUEST)}
      />
      <ButtonGenerateAction
        disabled={!canPreauthorize}
        icon={<Gavel size={20} />}
        title="Preautorizar viaje"
        onClick={() => setSelectedView(ViewEnum.SELECT_CARRIER)}
      />
    </Flex>
  );
};

export default ActionList;
