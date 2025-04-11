import { Flex, Select, Typography } from "antd";
import "./general-select.scss";
import {
  ControllerRenderProps,
  FieldErrorsImpl,
  FieldValues,
  Merge,
  FieldError as OriginalFieldError
} from "react-hook-form";

type ExtendedFieldError =
  | OriginalFieldError
  | Merge<OriginalFieldError, FieldErrorsImpl<{ value: number; label: string }>>;

interface PropsGeneralSelect<T extends FieldValues> {
  errors: ExtendedFieldError | undefined;
  field: ControllerRenderProps<T, any>;
  title: string;
  placeholder: string;
  options: { value: number; label: string }[] | undefined;
  loading?: boolean;
  customStyleContainer?: React.CSSProperties;
  errorMessage?: string;
}

const GeneralSelect = <T extends FieldValues>({
  errors,
  field,
  title,
  placeholder,
  options,
  loading = false,
  customStyleContainer,
  errorMessage
}: PropsGeneralSelect<T>) => {
  const usedOptions = options?.map((option) => {
    return {
      value: option.value,
      label: option.label,
      className: "selectOptions"
    };
  });

  return (
    <Flex vertical style={customStyleContainer}>
      <h4 className="inputTitle">{title}</h4>
      <Select
        placeholder={placeholder}
        className={errors ? "selectInputError" : "selectInputCustom"}
        loading={loading}
        variant="borderless"
        optionLabelProp="label"
        {...field}
        popupClassName="selectDrop"
        options={usedOptions}
        labelInValue
      />
      {errors && (
        <Typography.Text className="textError">
          {errorMessage ?? "Campo obligatorio *"}
        </Typography.Text>
      )}
    </Flex>
  );
};

export default GeneralSelect;
