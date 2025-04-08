import React, { useEffect } from "react";
import { Flex, Modal } from "antd";
import { Controller, useForm } from "react-hook-form";
import { CaretLeft } from "@phosphor-icons/react";

import { getRejectionCauses } from "@/services/logistics/acept_carrier";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import GeneralSelect from "@/components/ui/general-select";

import { ISelectType } from "@/types/global/IGlobal";

import "./modalRejectTripInvite.scss";

type ModalRejectTripInviteProps = {
  isOpen: boolean;
  handleRejectInvite: () => void;
  handleCancel?: () => void;
  loading?: boolean;
};

const ModalRejectTripInvite = ({
  isOpen,
  handleRejectInvite,
  handleCancel,
  loading = false
}: ModalRejectTripInviteProps) => {
  const [rejectionCauses, setRejectionCauses] = React.useState<ISelectType[]>();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue
  } = useForm<{
    rejectionCauses: ISelectType;
    commentary: string;
  }>({});

  const handleOnChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue("commentary", e.target.value);
  };

  const onSubmitRejectInvite = (data: any) => {
    console.log("data", data);
    handleRejectInvite();
  };

  //useEffect for fetching and cleaning the states when isOpen changes
  useEffect(() => {
    if (!rejectionCauses) {
      fetchRejectionCauses();
    }
    return () => {
      reset();
    };
  }, [isOpen]);

  const fetchRejectionCauses = async () => {
    const res = await getRejectionCauses();
    setRejectionCauses(
      res.map((item) => ({
        value: item.id,
        label: item.description
      }))
    );
  };

  return (
    <Modal
      className="modalRejectTripInvite"
      width={"60%"}
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      title={null}
      onOk={handleRejectInvite}
      destroyOnClose
    >
      <button className="modalRejectTripInvite__header" onClick={handleCancel}>
        <CaretLeft size={"1.25rem"} />
        <h4>Rechazar invitación de viaje</h4>
      </button>
      <p className={"modalRejectTripInvite__description"}>
        Estás rechazando la invitación a pártcipar del proces de selección de proveedor para la{" "}
        <strong>TR #XXXXX</strong>.
      </p>

      <Controller
        name="rejectionCauses"
        control={control}
        rules={{ required: true, minLength: 1 }}
        render={({ field }) => (
          <GeneralSelect
            errors={errors?.rejectionCauses}
            field={field}
            title="Selecciona la causal de rechazo"
            placeholder="Selecciona la causal"
            options={rejectionCauses}
          />
        )}
      />
      <div className={"modalRejectTripInvite__comment"}>
        <Flex vertical style={{ width: "100%" }}>
          <p>Comentarios</p>
          <textarea onChange={handleOnChangeTextArea} placeholder="Ingresar un comentario" />
        </Flex>
      </div>

      <FooterButtons
        handleOk={handleSubmit(onSubmitRejectInvite)}
        onCancel={handleCancel}
        titleConfirm="Rechazar invitación"
        isConfirmLoading={loading}
        isConfirmDisabled={!isValid}
      />
    </Modal>
  );
};

export default ModalRejectTripInvite;
