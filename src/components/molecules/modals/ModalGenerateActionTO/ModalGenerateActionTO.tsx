import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Flex, Modal } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { CaretLeft, X } from "phosphor-react";

import FinalizeTrip from "./FinalizeTrip/FinalizeTrip";
import ActionList from "./ActionList/ActionList";
import CarrierList from "./CarrierList/CarrierList";
import PreauthorizeTrip from "./PreauthorizeTrip/PreauthorizeTrip";
import { NavEnum } from "@/components/organisms/logistics/transfer-orders/details/Details";
import { ModalCancelTR } from "../ModalCancelTR/ModalCancelTR";
import { ModalConfirmAction } from "../ModalConfirmAction/ModalConfirmAction";

import { ITransferRequestDetail } from "@/types/transferRequest/ITransferRequest";
import { BillingByCarrier, BillingStatusEnum } from "@/types/logistics/billing/billing";

import styles from "./ModalGenerateActionTO.module.scss";

export enum ViewEnum {
  "SELECT_ACTION" = "SELECT_ACTION",
  "SELECT_CARRIER" = "SELECT_CARRIER",
  "FINALIZE_TRIP" = "FINALIZE_TRIP",
  "CHANGE_CARRIER_VEHICLE" = "CHANGE_CARRIER_VEHICLE",
  "CANCEL_TR" = "CANCEL_TR",
  "PREAUTHORIZE_TRIP" = "PREAUTHORIZE_TRIP",
  "MARK_AS_FIXED_INCOME" = "MARK_AS_FIXED_INCOME"
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
  handleMarkAsFixedIncome: () => void;
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
    transferRequest,
    handleMarkAsFixedIncome
  } = props;
  const [selectedView, setSelectedView] = useState<ViewEnum>(ViewEnum.SELECT_ACTION);
  const [selectedCarrier, setSelectedCarrier] = useState<number | null>(null);
  const billingsInStatusAcepted = carriersData.filter(
    (billing) => billing.statusDesc === BillingStatusEnum.Aceptadas
  );

  const router = useRouter();

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
            handleModifyTrip={() => router.push(`/logistics/transfer-request/${idTR}`)}
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
            onCancel={() => {
              setSelectedView(ViewEnum.SELECT_ACTION);
            }}
            onClose={onClose}
            noModal
            trID={transferRequest?.id}
            toIDs={transferRequest?.transfer_orders}
            trStatus={transferRequest?.status_id}
          />
        );
      case ViewEnum.MARK_AS_FIXED_INCOME:
        return (
          <>
            <ModalConfirmAction
              isOpen={selectedView === ViewEnum.MARK_AS_FIXED_INCOME}
              onClose={() => setSelectedView(ViewEnum.SELECT_ACTION)}
              title="Confirmar renta fija"
              content="¿Estás seguro de que deseas marcar este pedido como renta fija?"
              onOk={handleMarkAsFixedIncome}
              noModal
            />
          </>
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
            handleModifyTrip={() => router.push(`/logistics/transfer-request/${idTR}`)}
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
