import { Flex, message, Modal } from "antd";
import { ArrowsClockwise, Download, LinkBreak, Trash, X } from "phosphor-react";
import { useState } from "react";
import styles from "./ModalGenerateActionOrders.module.scss";
import {
  deleteOrders,
  downloadCsvTransferOrders,
  transferOrderMerge
} from "@/services/logistics/transfer-request";
import ProtectedComponent from "../../protectedComponent/ProtectedComponent";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { useRouter } from "next/navigation";
import { TMS_COMPONENTS, TMSMODULES } from "@/utils/constants/globalConstants";

type PropsModalGenerateActionTO = {
  isOpen: boolean;
  onClose: () => void;
  ordersId?: number[];
  trsIds?: number[];
};

export default function ModalGenerateActionOrders(props: Readonly<PropsModalGenerateActionTO>) {
  const { isOpen, onClose, ordersId = [], trsIds = [] } = props;
  const viewName: keyof typeof TMSMODULES = "TMS-Viajes";

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleCreateTransferRequest = async () => {
    const queryParam = ordersId.join(",");
    setIsLoading(true);
    try {
      await transferOrderMerge(ordersId);
      message.open({ content: "Operación realizada con éxito", type: "success" });
      router.push(`transfer-request/create/${queryParam}`);
    } catch (error) {
      if (error instanceof Error) message.open({ content: error.message, type: "error" });
      else message.open({ content: "Error al realizar la operación", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCsvOrders = async () => {
    setIsLoading(true);
    try {
      await downloadCsvTransferOrders();
    } catch (error) {
      if (error instanceof Error) message.open({ content: error.message, type: "error" });
      else message.open({ content: "Error al realizar la operación", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrders = async () => {
    setIsLoading(true);
    try {
      await deleteOrders(trsIds, ordersId);
      message.open({ content: "Operación realizada con éxito", type: "success" });
      onClose();
    } catch (error) {
      if (error instanceof Error)
        message.open({ content: error.message, type: "error", duration: 5 });
      else message.open({ content: "Error al realizar la operación", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      width={698}
      title={<p className={styles.actionTitle}>Generar acción</p>}
      styles={{
        body: {
          maxHeight: "85vh",
          overflowY: "auto",
          paddingTop: 16,
          scrollbarWidth: "none" /* Firefox */,
          msOverflowStyle: "none" /* Internet Explorer 10+ */
        }
      }}
      centered
      open={isOpen}
      onClose={() => onClose()}
      closeIcon={<X size={20} weight="bold" onClick={onClose} />}
      footer={<></>}
      loading={isLoading}
    >
      <p className={styles.selectTitle}>Selecciona la acción que vas a realizar</p>
      <Flex style={{ width: "100%", height: "100%", marginTop: 24 }} gap={12} vertical>
        <ProtectedComponent
          componentName={TMS_COMPONENTS[viewName].CREATE_TR}
          viewName={viewName}
          checkFunction={({ create_permission }) => create_permission}
        >
          <ButtonGenerateAction
            disabled={ordersId?.length === 0}
            icon={<LinkBreak size={20} />}
            title="Generar TR"
            onClick={handleCreateTransferRequest}
          />
        </ProtectedComponent>
        <ButtonGenerateAction
          disabled={true}
          icon={<ArrowsClockwise size={20} />}
          title="Cambio de estado"
          onClick={() => {}}
        />
        <ProtectedComponent
          componentName={TMS_COMPONENTS[viewName].DOWNLOAD_SHEET}
          viewName={viewName}
          checkFunction={({ create_permission }) => create_permission}
        >
          <ButtonGenerateAction
            disabled={false}
            icon={<Download size={20} />}
            title="Descargar ordenes"
            onClick={downloadCsvOrders}
          />
        </ProtectedComponent>
        <ButtonGenerateAction
          disabled={ordersId?.length === 0 && trsIds?.length === 0}
          icon={<Trash size={20} />}
          title="Eliminar servicio"
          onClick={handleDeleteOrders}
        />
      </Flex>
    </Modal>
  );
}
