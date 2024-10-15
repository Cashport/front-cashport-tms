import { Flex, Input, message } from "antd";
import FooterButtons from "../FooterButtons/FooterButtons";
import { ViewEnum } from "../ModalBillingAction";
import { SetStateAction, useState } from "react";
import styles from "./ConfirmClose.module.scss";
import { getAceptBilling, postRejectBilling } from "@/services/billings/billings";
import { formatNumber } from "@/utils/utils";

type ActionTypeClose = "ACCEPT" | "REJECT";

interface ConfirmClose {
  // eslint-disable-next-line no-unused-vars
  setSelectedView: (value: SetStateAction<ViewEnum>) => void;
  onClose: () => void;
  idTR: number;
  idBilling: number;
  totalValue: number;
  actionType: ActionTypeClose;
}

const ConfirmClose = ({
  setSelectedView,
  onClose,
  totalValue,
  idTR,
  idBilling,
  actionType
}: ConfirmClose) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [observation, setObervation] = useState<string>("");

  const aceptBilling = async () => {
    try {
      setIsLoading(true);
      const response = await getAceptBilling(idBilling);
      if (response) {
        message.success("Se aceptó el cierre correctamente", 2);
      }
    } catch (error) {
      message.error("Hubo un problema, vuelve a intentarlo", 2);
    } finally {
      onClose();
      setIsLoading(false);
    }
  };

  const rejectBilling = async () => {
    try {
      setIsLoading(true);
      const response = await postRejectBilling(idBilling, observation);
      if (response) {
        message.success(response, 3);
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al rechazar", 3);
    } finally {
      onClose();
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    actionType === "ACCEPT" ? aceptBilling() : rejectBilling();
  };

  return (
    <Flex vertical gap={24}>
      <p className={styles.subtitle}>
        Estas {actionType === "ACCEPT" ? "confirmando" : "rechazando"} la finalización de la{" "}
        <b>{`TR #${idTR}`}</b> por valor de <b>{`$${formatNumber(totalValue, 2)}`}</b>
      </p>
      {actionType === "REJECT" && (
        <Input
          placeholder="Observación (*)"
          className="puntoOrigen dateInputForm"
          key={"observacion"}
          value={observation}
          onChange={(e) => {
            setObervation(e.target.value);
          }}
        />
      )}
      <FooterButtons
        titleConfirm="Confirmar"
        onClose={onClose}
        handleOk={handleConfirm}
        isConfirmDisabled={actionType === "REJECT" && observation === ""}
        isConfirmLoading={isLoading}
      />
    </Flex>
  );
};
export default ConfirmClose;
