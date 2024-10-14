import { Flex, message, Skeleton } from "antd";
import FooterButtons from "../FooterButtons/FooterButtons";
import { ViewEnum } from "../ModalBillingAction";
import { Dispatch, SetStateAction, useState } from "react";
import styles from "./ConfirmClose.module.scss";
import { getAceptBilling } from "@/services/billings/billings";
import { MessageInstance } from "antd/es/message/interface";
import { formatNumber } from "@/utils/utils";
import { TabEnum } from "@/components/organisms/logistics/transfer-orders/TransferOrders";
import { useRouter } from "next/navigation";
interface ConfirmClose {
  setSelectedView: (value: SetStateAction<ViewEnum>) => void;
  onClose: () => void;
  idTR: number;
  idBilling: number;
  totalValue: number;
  messageApi: MessageInstance;
}

const ConfirmClose = ({
  setSelectedView,
  onClose,
  totalValue,
  idTR,
  messageApi,
  idBilling
}: ConfirmClose) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { push } = useRouter();

  const aceptBilling = async () => {
    setIsLoading(true);
    try {
      const response = await getAceptBilling(idBilling);
      if (response) {
        setIsLoading(false);
        onClose();
        message.success(`TR No. ${idTR} aceptada`, 2, () => push(`/facturacion`));
      }
    } catch (error: any) {
      setIsLoading(false);
      onClose();
      message.error("Hubo un error aceptando la orden", 2);
    }
  };
  const handleConfirm = () => {
    aceptBilling();
  };

  return (
    <Skeleton active loading={isLoading}>
      <Flex vertical gap={24}>
        <p className={styles.subtitle}>
          Estas confirmando la finalización de la <b>{`TR #${idTR}`}</b> por valor de{" "}
          <b>{`$${formatNumber(totalValue, 2)}`}</b>
        </p>
        <FooterButtons titleConfirm="Confirmar" onClose={onClose} handleOk={handleConfirm} />
      </Flex>
    </Skeleton>
  );
};
export default ConfirmClose;
