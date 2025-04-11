import { useEffect, useState } from "react";
import { Flex, message, Modal } from "antd";
import { Controller, useForm } from "react-hook-form";
import { CaretLeft } from "phosphor-react";

import { getPostponedReasons, postponeTR } from "@/services/logistics/transfer-request";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import GeneralSelect from "@/components/ui/general-select";
import { DataTypeForTransferOrderTable } from "../../tables/TransferOrderTable/TransferOrderTable";

import { ISelectType } from "@/types/global/IGlobal";

import "./modalPostponeTR.scss";

interface IFormModalPostponeTR {
  postponeReason: ISelectType;
  commentary: string;
}

interface Props {
  isOpen?: boolean;
  onCancel: () => void;
  onClose: () => void;
  allSelectedRows?: DataTypeForTransferOrderTable[];
}

export const ModalPostponeTR = ({ isOpen, onCancel, onClose, allSelectedRows }: Props) => {
  const [loading, setLoading] = useState(false);
  const [postponedReasons, setPostponedReasons] = useState<ISelectType[]>();

  const {
    handleSubmit,
    formState: { errors, isValid },
    reset,
    control
  } = useForm<IFormModalPostponeTR>({});
  //useEffect for fetching and cleaning the states when isOpen changes
  useEffect(() => {
    if (!postponedReasons) {
      fetchRejectionCauses();
    }
    return () => {
      reset();
    };
  }, [isOpen]);

  const fetchRejectionCauses = async () => {
    const res = await getPostponedReasons();
    setPostponedReasons(
      res.map((item) => ({
        value: item.id,
        label: item.description
      }))
    );
  };

  const onPostponeTR = async (data: IFormModalPostponeTR) => {
    setLoading(true);

    console.log("data", data);

    try {
      await postponeTR(
        allSelectedRows?.map((row) => Number(row.tr)) ?? [],
        data.commentary,
        data.postponeReason.label
      );
      message.success("TR(s) aplazada(s) exitosamente");
      onClose();
    } catch (error) {
      message.error(`Error al aplazar la(s) TR(s): ${error}`, 4);
    }
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
          <span>Confirmar acción</span>
        </button>

        <div className="ModalPostponeTR__content" style={{ height: "90%" }}>
          <p>
            Por favor confirma que estás aplazando los servicios{" "}
            <strong>{allSelectedRows?.map((row) => `TR #${row.tr}`)?.join(", ")}</strong>
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
              options={postponedReasons}
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
          titleConfirm="Aplazar Servicios"
          handleOk={handleSubmit(onPostponeTR)}
          onCancel={onCancel}
          isConfirmLoading={loading}
          isConfirmDisabled={!isValid}
        />
      </Flex>
    </Modal>
  );
};
