import { Select, Typography } from "antd";
import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import {
  FieldError as OriginalFieldError,
  ControllerRenderProps,
  FieldErrorsImpl,
  Merge,
  FieldValues
} from "react-hook-form";

import "./commonInputStyles.scss";
import { IResponseContactOptions } from "@/types/contacts/IContacts";

type ExtendedFieldError =
  | OriginalFieldError
  | Merge<OriginalFieldError, FieldErrorsImpl<{ value: number; label: string }>>;

interface SelectOption {
  value: string | number;
  label: string;
  className?: string;
}

interface Props<T extends FieldValues> {
  errors: ExtendedFieldError | undefined;
  field: ControllerRenderProps<T, any>;
  readOnly?: boolean;
  options?: SelectOption[];
  isLoading?: boolean;
}

export const SelectContactIndicative = <T extends FieldValues>({
  errors,
  field,
  readOnly,
  options: externalOptions,
  isLoading: externalLoading
}: Props<T>) => {
  const { data, isLoading: swrLoading } = useSWR<IResponseContactOptions>(
    externalOptions ? null : "/client/contact/options",
    fetcher,
    {}
  );

  const isLoading = externalLoading ?? swrLoading;

  const options =
    externalOptions ??
    (data?.data && !Array.isArray(data.data)
      ? data.data.country_calling_code.map((option) => ({
          value: option.id,
          label: `${option.code} ${option.country_name}`,
          className: "selectOptions"
        }))
      : []);

  return (
    <>
      <Select
        placeholder="Seleccione el tipo de radicado"
        className={errors ? "selectInputError" : `selectInputCustom ${readOnly && "--readOnly"}`}
        loading={isLoading}
        variant="borderless"
        optionLabelProp="label"
        {...field}
        popupClassName="selectDrop"
        options={options}
        labelInValue
        open={readOnly ? false : undefined}
      />
      {errors && (
        <Typography.Text className="textError">El indicativo es obligatorio *</Typography.Text>
      )}
    </>
  );
};
