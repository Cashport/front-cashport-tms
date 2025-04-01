import { Flex, Modal } from "antd";
import { CaretLeft, X } from "phosphor-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import styles from "./ModalGenerateActionTO.module.scss";
import { MessageInstance } from "antd/es/message/interface";
import ActionList from "./ActionList/ActionList";
import CarrierList from "./CarrierList/CarrierList";
import PreauthorizeTrip from "./PreauthorizeTrip/PreauthorizeTrip";
import { BillingByCarrier, BillingStatusEnum } from "@/types/logistics/billing/billing";
import FinalizeTrip from "./FinalizeTrip/FinalizeTrip";
import { NavEnum } from "@/components/organisms/logistics/transfer-orders/details/Details";
import { ModalCancelTR } from "../ModalCancelTR/ModalCancelTR";
import { ITransferRequestDetail } from "@/types/transferRequest/ITransferRequest";

export enum ViewEnum {
  "SELECT_ACTION" = "SELECT_ACTION",
  "SELECT_CARRIER" = "SELECT_CARRIER",
  "FINALIZE_TRIP" = "FINALIZE_TRIP",
  "CHANGE_CARRIER_VEHICLE" = "CHANGE_CARRIER_VEHICLE",
  "CANCEL_TR" = "CANCEL_TR",
  "MODIFY_REQUEST" = "MODIFY_REQUEST",
  "PREAUTHORIZE_TRIP" = "PREAUTHORIZE_TRIP"
}
type PropsModalGenerateActionTO = {
  idTR: string;
  carriersData: BillingByCarrier[];
  isOpen: boolean;
  onClose: () => void;
  messageApi: MessageInstance;
  canFinalizeTrip: boolean;
  statusTrId?: string;
  canChangeStatusToPorLegalizar: boolean;
  handleChangeStatus?: (statusId: string) => Promise<void>;
  setNav: Dispatch<SetStateAction<NavEnum>>;
  transferRequest: ITransferRequestDetail | null;
};

export default function ModalGenerateActionTO(props: Readonly<PropsModalGenerateActionTO>) {
  const {
    isOpen,
    onClose,
    idTR,
    carriersData,
    messageApi,
    canFinalizeTrip,
    statusTrId,
    canChangeStatusToPorLegalizar,
    handleChangeStatus,
    setNav,
    transferRequest
  } = props;
  const [selectedView, setSelectedView] = useState<ViewEnum>(ViewEnum.SELECT_ACTION);
  const [selectedCarrier, setSelectedCarrier] = useState<number | null>(null);
  const billingsInStatusAcepted = carriersData.filter(
    (billing) => billing.statusDesc === BillingStatusEnum.Aceptadas
  );

  const renderView = () => {
    switch (selectedView) {
      case ViewEnum.SELECT_ACTION:
        return (
          <ActionList
            setSelectedView={setSelectedView}
            canPreauthorize={billingsInStatusAcepted.length > 0}
            canFinalizeTrip={canFinalizeTrip}
            canChangeStatusToPorLegalizar={canChangeStatusToPorLegalizar}
            handleChangeStatus={handleChangeStatus}
            onClose={onClose}
          />
        );
      case ViewEnum.SELECT_CARRIER:
        return (
          <CarrierList
            setSelectedCarrier={setSelectedCarrier}
            carriers={billingsInStatusAcepted}
            setSelectedView={setSelectedView}
          />
        );
      case ViewEnum.PREAUTHORIZE_TRIP:
        return (
          <PreauthorizeTrip
            idTR={idTR}
            carrier={carriersData.find((cd) => cd.id == selectedCarrier) as BillingByCarrier}
            messageApi={messageApi}
            onClose={onClose}
          />
        );
      case ViewEnum.FINALIZE_TRIP:
        return (
          <FinalizeTrip
            idTR={idTR}
            messageApi={messageApi}
            onClose={onClose}
            statusTrId={statusTrId}
            setNav={setNav}
          />
        );
      case ViewEnum.CANCEL_TR:
        return (
          <ModalCancelTR
            onCancel={() => setSelectedView(ViewEnum.SELECT_ACTION)}
            noModal
            trID={transferRequest?.id}
            toIDs={transferRequest?.transfer_orders}
          />
        );
      default:
        return (
          <ActionList
            setSelectedView={setSelectedView}
            canPreauthorize={false}
            canFinalizeTrip={false}
            canChangeStatusToPorLegalizar={false}
            handleChangeStatus={handleChangeStatus}
            onClose={onClose}
          />
        );
    }
  };

  const renderTitle = () => {
    switch (selectedView) {
      case ViewEnum.SELECT_ACTION:
        return <p className={styles.selectTitle}>Selecciona la acción que vas a realizar</p>;
      case ViewEnum.SELECT_CARRIER:
        return <p className={styles.selectTitle}>Selecciona el proveedor a preautorizar</p>;
      case ViewEnum.PREAUTHORIZE_TRIP:
        return <p className={styles.actionTitle}>Cargar preautorización</p>;
      case ViewEnum.FINALIZE_TRIP:
        return (
          <Flex gap={8} align="center">
            <CaretLeft size={20} onClick={() => setSelectedView(ViewEnum.SELECT_ACTION)} />
            <p className={styles.actionTitle}>Finalización de viaje</p>
          </Flex>
        );
      default:
        return "";
    }
  };

  useEffect(() => {
    return () => {
      setSelectedView(ViewEnum.SELECT_ACTION);
    };
  }, [isOpen]);

  return (
    <Modal
      width={698}
      title={renderTitle()}
      styles={{
        body: {
          maxHeight: "85vh",
          overflowY: "auto",
          scrollbarWidth: "none" /* Firefox */,
          msOverflowStyle: "none" /* Internet Explorer 10+ */
        },
        header: {
          marginBottom: "1.5rem"
        }
      }}
      centered
      open={isOpen}
      onClose={() => onClose()}
      closeIcon={<X size={20} weight="bold" onClick={onClose} />}
      footer={<></>}
    >
      {renderView()}
    </Modal>
  );
}
