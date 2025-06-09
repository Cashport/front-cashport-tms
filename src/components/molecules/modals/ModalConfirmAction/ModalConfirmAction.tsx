import React from "react";
import { Modal } from "antd";

import "./modalConfirmAction.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOk?: () => void;
  title: string;
  content?: React.ReactNode;
  okText?: string;
  cancelText?: string;
  okLoading?: boolean;
}
export const ModalConfirmAction = ({
  isOpen,
  onClose,
  onOk,
  title,
  content,
  okText = "Aceptar",
  cancelText = "Cancelar",
  okLoading
}: Props) => {
  return (
    <Modal
      className="ModalConfirmAction"
      width={"50%"}
      open={isOpen}
      onCancel={onClose}
      okButtonProps={{ className: "acceptButton", loading: okLoading }}
      okText={okText}
      cancelButtonProps={{
        className: "cancelButton"
      }}
      cancelText={cancelText}
      title={title}
      onOk={onOk}
    >
      {content}
    </Modal>
  );
};
