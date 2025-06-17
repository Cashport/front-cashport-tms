import { useState } from "react";
import { Flex, Select } from "antd";
import { CaretLeft } from "phosphor-react";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

import "./modalModifyTrip.scss";
import { Controller, useForm } from "react-hook-form";

interface Props {
  onCancel: () => void;
}

interface IFormValues {
  motive: string;
  comment: string;
}

export const ModalModifyTrip = ({ onCancel }: Props) => {
  const [loading, setLoading] = useState(false);
  // react hook form used below
  const { handleSubmit, control, register } = useForm<IFormValues>();

  const onSubmit = async (data: IFormValues) => {
    console.log("Form data submitted:", data);
    try {
      // Handle form submission
    } catch (error) {
      // Handle error
    }
  };

  return (
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
          name="motive"
          rules={{ required: true }}
          render={({ field }) => (
            <Select
              {...field}
              placeholder=" - "
              options={[
                { value: "Aprobar", label: "Aprobar" },
                { value: "Rechazar", label: "Rechazar" }
              ]}
              className="modalModifyTrip__select"
            />
          )}
        />

        <Flex vertical>
          <h4>Comentarios</h4>
          <p>*Obligatorio</p>
        </Flex>

        <textarea
          className="modalModifyTrip__textarea"
          placeholder="Ingresar comentario"
          {...register("comment", { required: "Comentario es obligatorio" })}
        />
      </div>

      <FooterButtons
        titleConfirm="Confirmar cambio"
        handleOk={handleSubmit(onSubmit)}
        onCancel={onCancel}
        isConfirmLoading={loading}
      />
    </div>
  );
};
