import React, { useEffect, useState } from "react";
import { CaretLeft, X } from "phosphor-react";
import { Flex, Modal } from "antd";
import styles from "./ModalBillingAction.module.scss";
import ActionList from "./ActionList/ActionList";
import ConfirmClose from "./ConfirmClose/ConfirmClose";
import UploadInvoice from "./UploadInvoice/UploadInvoice";
import { MessageInstance } from "antd/es/message/interface";
import { BillingStatusEnum, IBillingDetails } from "@/types/logistics/billing/billing";
import UploadServiceSupport from "./UploadServiceSupport/UploadServiceSupport";

export enum ViewEnum {
  "SELECT" = "SELECT",
  "CONFIRM_CLOSE" = "CONFIRM_CLOSE",
  "CONFIRM_REJECT" = "CONFIRM_REJECT",
  "UPLOAD_INVOICE" = "UPLOAD_INVOICE",
  "UPLOAD_SERVICE_SUPPORT" = "UPLOAD_SERVICE_SUPPORT"
}

type PropsModal = {
  idBilling: number;
  idTR: number;
  totalValue: number;
  billingStatus?: BillingStatusEnum;
  isOpen: boolean;
  onClose: () => void;
  messageApi: MessageInstance;
  canEditForm?: boolean;
  uploadInvoiceTitle?: string;
  tripId?: number;
  billingData?: IBillingDetails;
};

export default function ModalBillingAction(props: Readonly<PropsModal>) {
  const {
    isOpen,
    onClose,
    idBilling,
    idTR,
    totalValue,
    billingStatus,
    messageApi,
    canEditForm = true,
    uploadInvoiceTitle,
    tripId,
    billingData
  } = props;
  const [selectedView, setSelectedView] = useState<ViewEnum>(ViewEnum.SELECT);

  useEffect(() => {
    if (isOpen && !canEditForm) setSelectedView(ViewEnum.UPLOAD_INVOICE);
  }, [isOpen, canEditForm]);

  const renderView = () => {
    switch (selectedView) {
      case ViewEnum.SELECT:
        return <ActionList setSelectedView={setSelectedView} billingStatus={billingStatus} />;
      case ViewEnum.CONFIRM_CLOSE:
        return (
          <ConfirmClose
            setSelectedView={setSelectedView}
            onClose={onClose}
            idTR={idTR}
            totalValue={totalValue}
            idBilling={idBilling}
            actionType="ACCEPT"
          />
        );
      case ViewEnum.CONFIRM_REJECT:
        return (
          <ConfirmClose
            setSelectedView={setSelectedView}
            onClose={onClose}
            idTR={idTR}
            totalValue={totalValue}
            idBilling={idBilling}
            actionType="REJECT"
          />
        );
      case ViewEnum.UPLOAD_INVOICE:
        return (
          <UploadInvoice
            idTR={idTR}
            idBilling={idBilling}
            onClose={onClose}
            messageApi={messageApi}
            canEditForm={canEditForm}
          />
        );
      case ViewEnum.UPLOAD_SERVICE_SUPPORT:
        return <UploadServiceSupport onClose={onClose} journeysData={billingData?.journeys} />;
      default:
        return <ActionList setSelectedView={setSelectedView} billingStatus={billingStatus} />;
    }
  };

  const renderTitle = () => {
    switch (selectedView) {
      case ViewEnum.SELECT:
        return <p className={styles.selectTitle}>Selecciona la acción que vas a realizar</p>;
      case ViewEnum.CONFIRM_CLOSE:
        return (
          <Flex gap={8} align="center">
            <CaretLeft size={20} onClick={() => setSelectedView(ViewEnum.SELECT)} />
            <p className={styles.actionTitle}>Aceptar cierre de TR</p>
          </Flex>
        );
      case ViewEnum.CONFIRM_REJECT:
        return (
          <Flex gap={8} align="center">
            <CaretLeft size={20} onClick={() => setSelectedView(ViewEnum.SELECT)} />
            <p className={styles.actionTitle}>Rechazar cierre de TR</p>
          </Flex>
        );
      case ViewEnum.UPLOAD_INVOICE:
        return !canEditForm && uploadInvoiceTitle ? (
          <p className={styles.actionTitle}>{uploadInvoiceTitle}</p>
        ) : (
          <p className={styles.actionTitle}>Cargar facturas</p>
        );
      case ViewEnum.UPLOAD_SERVICE_SUPPORT:
        return (
          <Flex gap={8} align="center">
            <CaretLeft size={20} onClick={() => setSelectedView(ViewEnum.SELECT)} />
            <p className={styles.actionTitle}>Documentos de legalización</p>
          </Flex>
        );
      default:
        return "";
    }
  };

  useEffect(() => {
    return () => {
      setSelectedView(ViewEnum.SELECT);
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
          paddingTop: 24,
          scrollbarWidth: "none" /* Firefox */,
          msOverflowStyle: "none" /* Internet Explorer 10+ */
        }
      }}
      centered
      open={isOpen}
      onClose={() => onClose()}
      closeIcon={
        selectedView !== ViewEnum.CONFIRM_CLOSE && <X size={20} weight="bold" onClick={onClose} />
      }
      footer={<></>}
    >
      {renderView()}
    </Modal>
  );
}
