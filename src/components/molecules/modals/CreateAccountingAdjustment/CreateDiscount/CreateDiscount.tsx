import React from "react";
import "./createDiscount.scss";
import { FieldError, useForm } from "react-hook-form";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import * as yup from "yup";
import { InputDateForm } from "@/components/atoms/inputs/InputDate/InputDateForm";
import { useFinancialDiscountMotives } from "@/hooks/useFinancialDiscountMotives";
import { yupResolver } from "@hookform/resolvers/yup";
import { createAccountingAdjustment } from "@/services/accountingAdjustment/accountingAdjustment";
import { InputSelect } from "@/components/atoms/inputs/InputSelect/InputSelect";
import { formatDateBars } from "@/utils/utils";
import { InputDateRange } from "@/components/atoms/inputs/InputDateRange/InputDateRange";
import { MessageInstance } from "antd/es/message/interface";

interface IformDiscount {
  motive: string;
  percentage: number;
  amount: number;
  validity_range: Date[];
  expiration_date: Date;
}

interface Props {
  onClose: () => void;
  messageApi: MessageInstance;
  projectIdParam?: string;
  clientIdParam?: string;
}

const schema = yup.object().shape({
  motive: yup.string().required("Campo obligatorio"),
  percentage: yup
    .number()
    .max(100, "El porcentaje no puede ser mayor al 100%")
    .required("Campo obligatorio"),
  amount: yup.number().min(0, "El valor no puede ser negativo").required("Campo obligatorio"),
  validity_range: yup
    .array()
    .of(yup.date().required("Campo obligatorio"))
    .min(2, "Debe seleccionar un rango de fechas")
    .required("Campo obligatorio"),
  expiration_date: yup
    .date()
    .required("Campo obligatorio")
    .min(
      yup.ref("validity_range[1]"),
      "La fecha de expiración debe ser posterior al rango de vigencia"
    )
});

export const CreateDiscount = ({ onClose, messageApi, projectIdParam, clientIdParam }: Props) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<IformDiscount>({
    resolver: yupResolver(schema)
  });
  const { data: motives, isLoading, isError } = useFinancialDiscountMotives();

  const handleSubmitForm = async (data: IformDiscount) => {
    try {
      await createAccountingAdjustment({
        type: 3,
        motive: motives?.find((motive) => motive.name === data.motive)?.id || 1,
        ammount: data.amount,
        percentage: data.percentage,
        date_of_issue: formatDateBars(data.validity_range[0].toISOString()),
        expiration_date: formatDateBars(data.expiration_date.toISOString()),
        validity_range: {
          start: formatDateBars(data.validity_range[0].toISOString()),
          end: formatDateBars(data.validity_range[1].toISOString())
        },
        users_aproved: [142, 146], // TODO: users_aproved esta mal escrito ya que el back lo pide asi
        project_id: projectIdParam || "19",
        client_id: clientIdParam || "98765232" // TODO: agregar cliente
      });
      messageApi.open({
        type: "success",
        content: "Descuento creado con éxito"
      });
      onClose();
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Oops ocurrio un error creando Descuento. Por favor, intente nuevamente."
      });
    }
  };

  return (
    <div className="createDicountCustom">
      <p className="subTitleModalAction">Ingresa la información para crear el nuevo descuento</p>
      <form className="modalContent" onSubmit={handleSubmit(handleSubmitForm)}>
        <div className="containterForm">
          <InputSelect
            titleInput="Motivo"
            nameInput="motive"
            control={control}
            error={errors.motive}
            options={motives?.map((motive) => ({ value: motive.name, label: motive.name })) || []}
            loading={isLoading}
            isError={isError}
            placeholder="Seleccionar motivo"
          />
          <div />
          <InputForm
            titleInput="Cupo total"
            nameInput="amount"
            control={control}
            error={errors.amount}
            placeholder="Ingresar valor"
            typeInput="number"
            customStyle={{ width: "100%" }}
          />
          <InputForm
            titleInput="Porcentaje a aplicar"
            nameInput="percentage"
            control={control}
            error={errors.percentage}
            placeholder="Ingresar valor"
            typeInput="number"
            customStyle={{ width: "100%" }}
          />
          <InputDateForm
            titleInput="Fecha de expiración"
            nameInput="expiration_date"
            placeholder="Seleccionar fecha de expiración"
            control={control}
            error={errors.expiration_date}
          />
          <InputDateRange
            titleInput="Rango de vigencia"
            nameInput="validity_range"
            control={control}
            error={errors.validity_range as FieldError}
          />
          <button
            type="button"
            className="button__action__text button__action__text__white"
            onClick={() => onClose()}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`button__action__text ${isValid ? "button__action__text__green" : ""}`}
          >
            Crear descuento
          </button>
        </div>
      </form>
    </div>
  );
};
