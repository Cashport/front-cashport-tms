import { useState } from "react";
import { Checkbox, CheckboxProps, Flex, Modal } from "antd";
import { CaretLeft } from "phosphor-react";

import ModalAttachEvidence from "../ModalEvidence/ModalAttachEvidence";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

import "./modalCancelTR.scss";

interface Props {
  isOpen?: boolean;
  onCancel: () => void;
  modalWidth?: string;
  noModal?: boolean;
  trID?: number;
  toIDs?: number[];
}

export const ModalCancelTR = ({ isOpen, onCancel, modalWidth, noModal, trID, toIDs }: Props) => {
  const [isSecondView, setIsSecondView] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<File[]>([]);
  const [commentary, setCommentary] = useState<string | undefined>();

  const cancelTR = () => {
    console.info("Cancelando TR");
  };

  const onChange: CheckboxProps["onChange"] = (e) => {
    console.info(`checked = ${e.target.checked}`);
  };

  const renderContent = () => {
    if (!isSecondView) {
      return (
        <Flex gap={"1rem"} vertical style={{ width: "100%", height: "100%" }}>
          <button onClick={onCancel} className="ModalCancelTR__header">
            <CaretLeft size="1.25rem" />
            <span>Cancelación de TR</span>
          </button>

          <div className="ModalCancelTR__content" style={{ height: "90%" }}>
            <div>
              <p>
                Tu viaje está en estado <strong>En curso</strong>
              </p>
              <p>La cancelación puede tener un costo asociado.</p>
            </div>

            <p>
              ¿Está seguro de cancelar la <strong>TR {trID}</strong>?
            </p>

            <p>
              La TR incluye las TO <strong>{toIDs?.join(", ")}</strong>
            </p>

            <Checkbox className="checkbox" onChange={onChange}>
              Cancelar las TO asociadas
            </Checkbox>
          </div>

          <FooterButtons
            titleConfirm="Cancelar TR"
            handleOk={() => setIsSecondView(true)}
            onCancel={onCancel}
          />
        </Flex>
      );
    }

    return (
      <ModalAttachEvidence
        handleAttachEvidence={cancelTR}
        selectedEvidence={selectedEvidence}
        setSelectedEvidence={setSelectedEvidence}
        commentary={commentary}
        setCommentary={setCommentary}
        setShowEvidenceModal={setIsSecondView}
        handleCancel={() => setIsSecondView(false)}
        customTexts={{
          description: "Debes adjuntar el motivo de la cancelación de la TR"
        }}
      />
    );
  };

  if (noModal) {
    return (
      <Flex gap={"1.5rem"} vertical style={{ width: "100%", height: "100%" }}>
        {renderContent()}
      </Flex>
    );
  }

  return (
    <Modal
      centered
      className="ModalCancelTR"
      width={modalWidth ?? "55%"}
      open={isOpen}
      footer={null}
      closable={false}
    >
      {renderContent()}
    </Modal>
  );
};
