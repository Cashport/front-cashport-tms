import { Dispatch, SetStateAction } from "react";
import { ViewEnum } from "../ModalBillingAction";
import { Flex } from "antd";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { MapPinLine, Receipt } from "phosphor-react";
import { BillingStatusEnum } from "@/types/logistics/billing/billing";

const ActionList = ({
  setSelectedView,
  billingStatus
}: {
  setSelectedView: Dispatch<SetStateAction<ViewEnum>>;
  billingStatus?: BillingStatusEnum;
}) => {
  const canAccept = billingStatus ? billingStatus === BillingStatusEnum.PorAceptar : false;
  const canUploadInvoices = billingStatus
    ? billingStatus === BillingStatusEnum.Preautorizado
    : false;
  return (
    <Flex style={{ width: "100%", height: "100%" }} gap={12} vertical>
      <ButtonGenerateAction
        disabled={!canAccept}
        icon={<MapPinLine size={20} />}
        title="Aceptar cierre de TR"
        onClick={() => setSelectedView(ViewEnum.CONFIRM_CLOSE)}
      />
      <ButtonGenerateAction
        disabled={!canAccept}
        icon={<MapPinLine size={20} />}
        title="Rechazar cierre de TR"
        onClick={() => setSelectedView(ViewEnum.CONFIRM_REJECT)}
      />
      <ButtonGenerateAction
        disabled={!canUploadInvoices}
        icon={<Receipt size={20} />}
        title="Cargar factura"
        onClick={() => setSelectedView(ViewEnum.UPLOAD_INVOICE)}
      />
    </Flex>
  );
};

export default ActionList;
