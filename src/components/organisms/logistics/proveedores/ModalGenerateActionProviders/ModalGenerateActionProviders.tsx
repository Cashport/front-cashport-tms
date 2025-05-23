import React from "react";
import { UseFormReset } from "react-hook-form";
import { Flex, Modal, Typography, message } from "antd";
import { User } from "@phosphor-icons/react";
import {
  ArrowsClockwise,
  CheckCircle,
  Envelope,
  Files,
  MagnifyingGlass,
  Megaphone,
  Pencil,
  Trash
} from "phosphor-react";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";

const { Title } = Typography;

type StatusForm = "review" | "create" | "edit";

type ModalGenerateActionProps = {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  handleOpenModal: (modalNumber: number) => void;
  selectedDocumentRows?: any[];
  statusForm: StatusForm;
  // eslint-disable-next-line no-unused-vars
  handleFormState: (newFormState: StatusForm) => void;
  resetForm: UseFormReset<any>;
};

const ModalGenerateActionProviders: React.FC<ModalGenerateActionProps> = ({
  isOpen,
  onClose,
  handleOpenModal,
  selectedDocumentRows,
  statusForm,
  handleFormState,
  resetForm
}) => {
  return (
    <Modal
      centered
      open={isOpen}
      onClose={onClose}
      title={<Title level={4}>Generar acción</Title>}
      footer={null}
      onCancel={onClose}
    >
      <Flex vertical gap={12}>
        <ButtonGenerateAction
          icon={<Pencil size={20} />}
          title={statusForm === "review" ? "Editar" : "Cancelar edición"}
          onClick={() => {
            if (statusForm === "review") {
              handleFormState("edit");
              onClose();
            } else {
              handleFormState("review");
              onClose();
              resetForm();
              handleOpenModal(0);
            }
          }}
        />

        <ButtonGenerateAction
          icon={<ArrowsClockwise size={20} />}
          title="Cambiar de estado"
          onClick={() => {
            handleOpenModal(2);
          }}
        />

        <ButtonGenerateAction
          icon={<CheckCircle size={20} />}
          title="Auditar"
          onClick={() => {
            handleOpenModal(3);
          }}
        />

        <ButtonGenerateAction
          icon={<Files size={20} />}
          title="Agregar requerimiento"
          onClick={() => {
            handleOpenModal(4);
          }}
        />

        <ButtonGenerateAction
          icon={<MagnifyingGlass size={20} />}
          title="Auditar requerimientos"
          onClick={() => {
            if (!selectedDocumentRows || selectedDocumentRows.length === 0) {
              return message.error("No hay documentos seleccionados para auditar.");
            }

            handleOpenModal(5);
          }}
        />
        <ButtonGenerateAction icon={<User size={20} />} disabled={true} title="Crear cliente" />
        <ButtonGenerateAction
          icon={<Trash size={20} />}
          title="Eliminar requerimientos"
          onClick={() => {
            if (!selectedDocumentRows || selectedDocumentRows.length === 0) {
              return message.error("No hay documentos seleccionados para eliminar.");
            }

            handleOpenModal(6);
          }}
        />
        <ButtonGenerateAction
          icon={<Megaphone size={20} />}
          title="Enviar recordatorio"
          disabled={true}
        />
        <ButtonGenerateAction
          icon={<Envelope size={20} />}
          title="Enviar invitación"
          disabled={true}
        />
      </Flex>
    </Modal>
  );
};

export default ModalGenerateActionProviders;
