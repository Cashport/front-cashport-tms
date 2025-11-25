import { useEffect, useState } from "react";
import { Flex, message, Modal } from "antd";
import { useForm } from "react-hook-form";

import { addTOToOngoingTR } from "@/services/logistics/transfer-request";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { DataTypeForTransferOrderTable } from "../../tables/TransferOrderTable/TransferOrderTable";

import "./modalAddTR2TO.scss";

interface IFormModalAddTR2TO {
  trId: string;
}

interface Props {
  isOpen?: boolean;
  onCancel: () => void;
  onClose: () => void;
  onSuccess?: () => void;
  allSelectedRows?: DataTypeForTransferOrderTable[];
}

export const ModalAddTR2TO = ({ isOpen, onCancel, onClose, onSuccess, allSelectedRows }: Props) => {
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    formState: { errors, isValid },
    reset,
    control
  } = useForm<IFormModalAddTR2TO>({});
  //useEffect for fetching and cleaning the states when isOpen changes
  useEffect(() => {
    if (isOpen) {
      reset();
    }
    return () => {
      reset();
    };
  }, [isOpen]);

  const onAddTO2TR = async (data: IFormModalAddTR2TO) => {
    setLoading(true);

    try {
      // Extract TO ID and convert TR ID to number
      const toId = allSelectedRows?.[0]?.key || 0;
      const trId = parseInt(data.trId, 10);

      if (isNaN(trId)) {
        message.error("El ID de la TR debe ser un número válido");
        setLoading(false);
        return;
      }

      // Call API to add TO to TR
      await addTOToOngoingTR(toId, trId);

      message.success("TO añadida a la TR con éxito");
      onClose();

      // Call onSuccess callback if provided to refresh data
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      message.error(`Error al añadir la TO a la TR: ${error}`);
    }
    setLoading(false);
  };

  return (
    <Modal
      centered
      className="ModalAddTR2TO"
      width={"55%"}
      open={isOpen}
      footer={null}
      closable={false}
      destroyOnClose
    >
      <Flex gap={"1rem"} vertical style={{ width: "100%", height: "100%" }}>
        <h4 className="ModalAddTR2TO__header">Añadir TO a TR en curso</h4>
        <p>Escribe el ID de la TR a la que deseas añadir la orden de transferencia</p>

        <InputForm
          nameInput="trId"
          titleInput="ID de la TR"
          placeholder="Ejemplo: 12345"
          typeInput="number"
          control={control}
          error={errors.trId}
          validationRules={{
            required: "El ID de la TR es obligatorio",
            pattern: {
              value: /^\d+$/,
              message: "Debe ser un número válido"
            }
          }}
        />

        <FooterButtons
          titleConfirm="Añadir TO a TR"
          handleOk={handleSubmit(onAddTO2TR)}
          onCancel={onCancel}
          isConfirmLoading={loading}
          isConfirmDisabled={!isValid}
        />
      </Flex>
    </Modal>
  );
};
