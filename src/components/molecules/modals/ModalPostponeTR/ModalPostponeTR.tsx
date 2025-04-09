import { useEffect, useState } from "react";
import { Flex, message, Modal } from "antd";
import { Controller, useForm } from "react-hook-form";
import { CaretLeft } from "phosphor-react";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

import { ISelectType } from "@/types/global/IGlobal";

import "./modalPostponeTR.scss";
import GeneralSelect from "@/components/ui/general-select";

interface IFormModalPostponeTR {
  postponeReason: ISelectType;
  commentary: string;
}

interface Props {
  isOpen?: boolean;
  onCancel: () => void;
  onClose: () => void;
  trIDs?: string[] | number[];
}

export const ModalPostponeTR = ({ isOpen, onCancel, onClose, trIDs }: Props) => {
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    formState: { errors, isValid },
    reset,
    control
  } = useForm<IFormModalPostponeTR>({});
  // useEffect for cleaning states when modal is closed
  useEffect(() => {
    return () => {
      reset();
    };
  }, [isOpen]);

  const postponeTR = async (data: IFormModalPostponeTR) => {
    setLoading(true);

    console.log("data", data);

    // try {
    //   // await deleteTransferRequestAndChildren(reqData, selectedEvidence[0]);
    //   message.success("TR(s) aplazada(s) exitosamente");
    //   onClose();
    // } catch (error) {
    //   message.error(`Error al aplazar la(s) TR(s): ${error}`, 4);
    // }
    setLoading(false);
  };

  return (
    <Modal
      centered
      className="ModalPostponeTR"
      width={"55%"}
      open={isOpen}
      footer={null}
      closable={false}
    >
      <Flex gap={"1rem"} vertical style={{ width: "100%", height: "100%" }}>
        <button onClick={onCancel} className="ModalPostponeTR__header">
          <CaretLeft size="1.25rem" />
          <span>Cancelación de TR</span>
        </button>

        <div className="ModalPostponeTR__content" style={{ height: "90%" }}>
          <p>
            Por favor confirma que estás aplazando los servicios{" "}
            <strong>TR {trIDs?.join(",")}</strong>
          </p>
        </div>

        <Controller
          name="postponeReason"
          control={control}
          rules={{ required: true, minLength: 1 }}
          render={({ field }) => (
            <GeneralSelect
              errors={errors?.postponeReason}
              field={field}
              title="Selecciona la causal de esta acción"
              placeholder="Selecciona la causal"
              options={[
                {
                  value: 1,
                  label: "description"
                }
              ]}
            />
          )}
        />

        <Controller
          name="commentary"
          control={control}
          rules={{ required: "Este campo es obligatorio" }}
          render={({ field }) => (
            <div className={"ModalPostponeTR__comment"}>
              <Flex vertical style={{ width: "100%" }}>
                <p>Comentarios</p>
                <textarea
                  {...field}
                  placeholder="Ingresar un comentario"
                  className={errors.commentary ? "error-input" : ""}
                />
                {errors.commentary && (
                  <span className="error-message">{errors.commentary.message}</span>
                )}
              </Flex>
            </div>
          )}
        />

        <FooterButtons
          titleConfirm="Cancelar TR"
          handleOk={handleSubmit(postponeTR)}
          onCancel={onCancel}
          isConfirmLoading={loading}
          isConfirmDisabled={!isValid}
        />
      </Flex>
    </Modal>
  );
};
