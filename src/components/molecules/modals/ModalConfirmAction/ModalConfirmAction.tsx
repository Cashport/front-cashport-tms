import React from "react";
import { Flex, Modal } from "antd";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
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
  noModal?: boolean;
}
export const ModalConfirmAction = ({
  isOpen,
  onClose,
  onOk,
  title,
  content,
  okText = "Aceptar",
  cancelText = "Cancelar",
  okLoading,
  noModal
}: Props) => {
  if (noModal) {
    return (
      <Flex vertical align="center" gap={"1.5rem"} className="ModalConfirmAction">
        <h3 className="ModalConfirmAction__title">{title}</h3>
        {content}
        <FooterButtons
          stylesContainer={{ width: "100%" }}
          titleCancel={cancelText}
          titleConfirm={okText}
          onCancel={onClose}
          handleOk={onOk ?? (() => {})}
          isConfirmLoading={okLoading}
        />
      </Flex>
    );
  }
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
