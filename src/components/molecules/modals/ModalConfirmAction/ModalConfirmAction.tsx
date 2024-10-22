import React, { ReactNode } from "react";
import { Modal } from "antd";
import { FooterButtons } from "../ModalCreateJourney/components/FooterButtons/FooterButtons";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  bodyText: ReactNode | string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  bodyText,
  onConfirm,
  onCancel,
  confirmButtonText = "Confirmar",
  cancelButtonText = "Cancelar"
}) => {
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      footer={
        <FooterButtons
          backTitle={cancelButtonText}
          nextTitle={confirmButtonText}
          handleBack={onCancel}
          handleNext={onConfirm}
          nextDisabled={false}
        />
      }
    >
      {typeof bodyText === "string" ? <p>{bodyText}</p> : bodyText}
    </Modal>
  );
};

export default ConfirmModal;
