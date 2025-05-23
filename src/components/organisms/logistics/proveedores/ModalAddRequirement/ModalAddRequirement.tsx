"use client";
import { Flex, Modal, Typography } from "antd";
import { Files, ListChecks } from "@phosphor-icons/react";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DocumentList from "./DocumentList";
import { CreateDocument } from "./CreateDocument";

const { Title } = Typography;

interface Props {
  isOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  onClose: (cancelClicked?: boolean) => void;
  subjectId: number;
}
type ActionType = "document" | "form" | null;
export const ModalAddRequirement = ({ isOpen, onClose, subjectId }: Props) => {
  const [isModalCreateDocumentOpen, setIsModalCreateDocumentOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<ActionType>(null);
  const router = useRouter();
  const handleActionClick = (action: ActionType) => {
    setCurrentAction(action);
  };

  const renderContent = () => {
    if (currentAction === null) {
      return (
        <Flex vertical gap="0.75rem">
          <ButtonGenerateAction
            onClick={() => handleActionClick("document")}
            icon={<Files size={16} />}
            title="Documento"
          />
          <ButtonGenerateAction
            icon={<ListChecks size={16} />}
            title="Formulario"
            onClick={() => handleActionClick("form")}
            disabled={true}
          />
        </Flex>
      );
    }

    if (currentAction === "document") {
      return (
        <DocumentList
          onClose={(cancelClicked) => {
            if (cancelClicked) return setCurrentAction(null);
            onClose();
            setCurrentAction(null);
          }}
          subjectId={subjectId}
          addNewDocument={() => setIsModalCreateDocumentOpen(true)}
          listType={"documents"}
        />
      );
    }

    if (currentAction === "form") {
      return (
        <DocumentList
          onClose={() => setCurrentAction(null)}
          subjectId={subjectId}
          addNewDocument={() => router.push("/proyectos/create-form")}
          listType={"forms"}
        />
      );
    }
  };
  const getTitle = () => {
    if (currentAction === null) {
      return "Requerimiento";
    }
    if (currentAction === "document") {
      return "Documentos";
    }
    if (currentAction === "form") {
      return "Formularios";
    }
  };

  return (
    <Modal
      open={isOpen}
      centered
      title={<Title level={4}>{getTitle()}</Title>}
      footer={null}
      onCancel={() => onClose(true)}
      width={"43rem"}
    >
      {renderContent()}
      <CreateDocument
        isOpen={isModalCreateDocumentOpen}
        mode="create"
        onClose={() => setIsModalCreateDocumentOpen(false)}
        onSubmit={() => {}}
      />
    </Modal>
  );
};
