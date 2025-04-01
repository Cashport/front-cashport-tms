import { useState } from "react";
import { Checkbox, CheckboxProps, Modal } from "antd";
import { CaretLeft } from "phosphor-react";
import ModalAttachEvidence from "../ModalEvidence/ModalAttachEvidence";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

import "./modalCancelTR.scss";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
}

export const ModalCancelTR = ({ isOpen, onCancel }: Props) => {
  const [isSecondView, setIsSecondView] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<File[]>([]);
  const [commentary, setCommentary] = useState<string | undefined>();

  const cancelTR = () => {
    console.log("Cancelando TR");
  };

  const onChange: CheckboxProps["onChange"] = (e) => {
    console.log(`checked = ${e.target.checked}`);
  };

  return (
    <Modal className="ModalCancelTR" width="50%" open={isOpen} footer={null} closable={false}>
      {!isSecondView ? (
        <>
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
              ¿Está seguro de cancelar la <strong>TR XX</strong>?
            </p>

            <p>
              La TR incluye las TO <strong>XXXX, XXXX</strong>
            </p>

            <Checkbox className="checkbox" onChange={onChange}>
              Cancelar las TO asociadas
            </Checkbox>
          </div>

          <FooterButtons
            titleConfirm="Cancelar TR"
            handleOk={() => setIsSecondView(true)}
            onCancel={() => console.log("cancelar")}
          />
        </>
      ) : (
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
      )}
    </Modal>
  );
};
