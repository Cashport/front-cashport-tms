import { Dispatch, SetStateAction, useState } from "react";
import { useRouter } from "next/navigation";
import { Flex, message, Modal } from "antd";
import { ArrowsClockwise, Download, LinkBreak, PauseCircle, Trash, X } from "phosphor-react";
import { MinusCircle } from "@phosphor-icons/react";

import {
  deleteOrders,
  downloadCsvTransferOrders,
  transferOrderMerge
} from "@/services/logistics/transfer-request";
import { STATUS } from "@/utils/constants/globalConstants";
import { TMS_COMPONENTS, TMSMODULES } from "@/utils/constants/globalConstants";

import ProtectedComponent from "../../protectedComponent/ProtectedComponent";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { DataTypeForTransferOrderTable } from "../../tables/TransferOrderTable/TransferOrderTable";

import styles from "./ModalGenerateActionOrders.module.scss";

type PropsModalGenerateActionTO = {
  isOpen: boolean;
  onClose: (resetStates?: boolean) => void;
  ordersId?: string[];
  trsIds?: string[];
  setIsModalOpen: Dispatch<
    SetStateAction<{
      selected: number;
    }>
  >;
  allSelectedRows?: DataTypeForTransferOrderTable[];
};

export default function ModalGenerateActionOrders(props: Readonly<PropsModalGenerateActionTO>) {
  const { TR } = STATUS;

  const { isOpen, onClose, ordersId = [], trsIds = [], setIsModalOpen, allSelectedRows } = props;
  const viewName: keyof typeof TMSMODULES = "TMS-Viajes";

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleCreateTransferRequest = async () => {
    const queryParam = ordersId.join(",");
    setIsLoading(true);
    try {
      await transferOrderMerge(ordersId.map((id) => Number(id)));
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

  const handlePostponeTR = async () => {
    setIsModalOpen({ selected: 3 });
  };

  const handleDeleteOrders = async () => {
    setIsLoading(true);
    if (trsIds?.length === 1 && ordersId?.length === 0) {
      //open ModalCancel
      setIsModalOpen({ selected: 2 });
      return setIsLoading(false);
    }
    try {
      await deleteOrders(trsIds, ordersId);
      message.open({ content: "Operación realizada con éxito", type: "success" });
      onClose(true);
    } catch (error) {
      if (error instanceof Error)
        message.open({ content: error.message, type: "error", duration: 5 });
      else message.open({ content: "Error al realizar la operación", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const validStatus4Postpone = [TR.ASIGNANDO_VEHICULO, TR.ESPERANDO_PROVEEDOR];

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
      closeIcon={<X size={20} weight="bold" onClick={() => onClose()} />}
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
          disabled={
            allSelectedRows?.length === 0 ||
            !allSelectedRows?.every(
              (row) =>
                validStatus4Postpone.includes(row.statusId) &&
                row.statusId === allSelectedRows[0]?.statusId
            )
          }
          icon={<PauseCircle size={20} />}
          title="Aplazar TR"
          onClick={handlePostponeTR}
        />
        <ButtonGenerateAction
          disabled={
            (ordersId?.length === 0 && trsIds?.length === 0) ||
            (ordersId?.length === 0 && trsIds?.length > 1)
          }
          icon={
            trsIds?.length === 1 && ordersId?.length === 0 ? (
              <MinusCircle size={20} />
            ) : (
              <Trash size={20} />
            )
          }
          title={
            trsIds?.length === 1 && ordersId?.length === 0
              ? "Cancelación del TR"
              : "Eliminar servicio"
          }
          onClick={handleDeleteOrders}
        />
      </Flex>
    </Modal>
  );
}
