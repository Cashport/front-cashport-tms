/* eslint-disable no-unused-vars */
import React, { FC } from "react";
import { Modal, Select, Typography } from "antd";
import { X } from "phosphor-react";

import FooterButtons from "../ModalBillingAction/FooterButtons/FooterButtons";

const { Title } = Typography;

export interface RequirementOption {
  value: number;
  label: string;
}

interface AddRequirementModalProps {
  isModalOpen: boolean;
  otherRequirementsOptions: RequirementOption[];
  selectedRequirement: RequirementOption | null;
  setSelectedRequirement: (option: RequirementOption | null) => void;
  setIsModalOpen: (open: boolean) => void;
  appendRequirement: (requirement: {
    idRequirement: number;
    description: string;
    units: number;
  }) => void;
  isLoadingRequirements: boolean;
}

const AddRequirementModal: FC<AddRequirementModalProps> = ({
  isModalOpen,
  otherRequirementsOptions,
  selectedRequirement,
  setSelectedRequirement,
  setIsModalOpen,
  appendRequirement,
  isLoadingRequirements
}) => {
  return (
    <Modal
      centered
      open={isModalOpen}
      width={698}
      onCancel={() => setIsModalOpen(false)}
      closeIcon={<X size={20} weight="bold" onClick={() => setIsModalOpen(false)} />}
      title={<Title level={4}>Requerimientos adicionales</Title>}
      styles={{
        body: {
          maxHeight: "85vh"
        }
      }}
      footer={
        <FooterButtons
          titleConfirm="Agregar requerimiento"
          isConfirmDisabled={!selectedRequirement}
          onClose={() => setIsModalOpen(false)}
          handleOk={() => {
            if (selectedRequirement) {
              appendRequirement({
                idRequirement: selectedRequirement.value,
                description: selectedRequirement.label,
                units: 1
              });
              setIsModalOpen(false);
              setSelectedRequirement(null);
            }
          }}
        />
      }
    >
      <Select
        showSearch
        placeholder="Seleccione el requerimiento adicional"
        style={{ width: "100%", height: "45px" }}
        options={otherRequirementsOptions}
        onSelect={(value, option) => {
          option && setSelectedRequirement(option);
        }}
        value={selectedRequirement}
        loading={isLoadingRequirements}
      />
    </Modal>
  );
};

export default AddRequirementModal;
