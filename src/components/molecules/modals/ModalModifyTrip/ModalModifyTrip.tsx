"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Flex, message, Modal, Select } from "antd";
import { CaretLeft } from "phosphor-react";

import { finishTransferRequest, getModifyOptions } from "@/services/logistics/transfer-request";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

import { TransferRequestFinish } from "@/types/logistics/transferRequest/transferRequest";

import "./modalModifyTrip.scss";

interface Props {
  onCancel: () => void;
  isOpen?: boolean;
  TRData?: TransferRequestFinish;
}

interface IFormValues {
  optionId: number;
  observations: string;
}

// All fields optional
type IFormValuesOptional = {
  [K in keyof IFormValues]?: IFormValues[K];
};

export const ModalModifyTrip = ({ onCancel, isOpen, TRData }: Props) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<{ value: number; label: string }[]>([]);

  const { handleSubmit, control, reset } = useForm<IFormValues>({
    defaultValues
  });

  useEffect(() => {
    const fetchModifyOptions = async () => {
      try {
        const response = await getModifyOptions();
        const formattedOptions = response.map((option) => ({
          value: option.id,
          label: option.description
        }));
        setOptions(formattedOptions);
      } catch (error) {
        message.error("Error al cargar los motivos de modificación");
      }
    };
    fetchModifyOptions();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      reset(defaultValues);
    }
  }, [isOpen]);

  const onSubmit = async (data: IFormValues) => {
    setLoading(true);

    try {
      if (TRData) {
        await finishTransferRequest(TRData, data);
        message.success(`TR No. ${TRData.id} asignada`);
        router.push("/logistics/transfer-orders");
      } else {
        message.error("No se encontró la información de la TR.");
      }
    } catch (error) {
      message.error("Error al finalizar la TR. Por favor, inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal centered width={686} open={isOpen} footer={null} closable={false}>
      <div className="modalModifyTrip">
        <button onClick={onCancel} className="modalModifyTrip__header">
          <CaretLeft size="1.25rem" />
          <span>Modificación de TR</span>
        </button>

        <p className="modalModifyTrip__description">
          Debes informar el motivo del cambio del precio de la TR{" "}
        </p>

        <div className="modalModifyTrip__content">
          <Flex vertical>
            <h4>Motivo del cambio</h4>
            <p>*Obligatorio</p>
          </Flex>
          <Controller
            control={control}
            name="optionId"
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                {...field}
                placeholder=" - "
                options={options}
                className="modalModifyTrip__select"
              />
            )}
          />

          <Flex vertical>
            <h4>Comentarios</h4>
            <p>*Obligatorio</p>
          </Flex>

          <Controller
            control={control}
            name="observations"
            rules={{ required: "Comentario es obligatorio" }}
            render={({ field }) => (
              <textarea
                {...field}
                className="modalModifyTrip__textarea"
                placeholder="Ingresar comentario"
              />
            )}
          />
        </div>

        <FooterButtons
          titleConfirm="Confirmar cambio"
          handleOk={handleSubmit(onSubmit)}
          onCancel={onCancel}
          isConfirmLoading={loading}
        />
      </div>
    </Modal>
  );
};

const defaultValues: IFormValuesOptional = {
  optionId: undefined,
  observations: ""
};
