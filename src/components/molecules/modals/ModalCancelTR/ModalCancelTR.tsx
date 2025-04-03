import { useEffect, useState } from "react";
import { Checkbox, CheckboxProps, Flex, message, Modal } from "antd";
import { CaretLeft } from "phosphor-react";

import ModalAttachEvidence from "../ModalEvidence/ModalAttachEvidence";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

import "./modalCancelTR.scss";
import { deleteTransferRequestAndChildren } from "@/services/logistics/transfer-request";

interface Props {
  isOpen?: boolean;
  onCancel: () => void;
  onClose: () => void;
  modalWidth?: string;
  noModal?: boolean;
  trID?: string | number;
  toIDs?: string[] | number[];
  trStatus?: string;
}

export const ModalCancelTR = ({
  isOpen,
  onCancel,
  onClose,
  modalWidth,
  noModal,
  trID,
  toIDs,
  trStatus
}: Props) => {
  const [isSecondView, setIsSecondView] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<File[]>([]);
  const [commentary, setCommentary] = useState<string>();
  const [checkedCancelTOs, setCheckCancelTOs] = useState(false);
  const [loading, setLoading] = useState(false);

  // const isProcessing = trStatus === "En curso" ? true : false;

  // useEffect for cleaning states when modal is closed
  useEffect(() => {
    return () => {
      setIsSecondView(false);
      setSelectedEvidence([]);
      setCommentary("");
      setCheckCancelTOs(false);
    };
  }, [isOpen]);

  const cancelTR = async () => {
    setLoading(true);

    const reqData = {
      transferRequestIds: [Number(trID)],
      transferOrderIds: checkedCancelTOs ? toIDs?.map((to) => Number(to)) ?? [] : [],
      comment: commentary ?? ""
    };

    try {
      await deleteTransferRequestAndChildren(reqData, selectedEvidence[0]);
      message.success("Cancelación exitosa");
      onClose();
    } catch (error) {
      message.error(`Error al cancelar la TR: ${error}`, 4);
    }
    setLoading(false);
  };

  const onChange: CheckboxProps["onChange"] = (e) => {
    setCheckCancelTOs(e.target.checked);
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

            {toIDs && toIDs?.length > 0 && (
              <p>
                La TR incluye las TO <strong>{toIDs?.join(", ")}</strong>
              </p>
            )}

            <Checkbox className="checkbox" onChange={onChange}>
              Cancelar las TO asociadas
            </Checkbox>
          </div>

          <FooterButtons
            titleConfirm="Cancelar TR"
            handleOk={() => setIsSecondView(true)}
            onCancel={onCancel}
            isConfirmLoading={loading}
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
        loading={loading}
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
