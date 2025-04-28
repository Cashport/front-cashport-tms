import { Select, Typography } from "antd";

import "./SelectInputForm.scss";

interface Props {
  placeholder?: string;
  error: any;
  field: any;
  selected?: any;
  options?: { id: number; value: string }[];
  loading?: boolean;
  allowClear?: boolean;
  showSearch?: boolean;
}

export const SelectInputForm = ({
  placeholder = "Selecciona",
  error,
  field,
  selected,
  options,
  loading = false,
  allowClear = false,
  showSearch = false
}: Props) => {
  const optionsFormated = options?.map((option: { id: number; value: string }) => {
    return {
      value: option.id,
      label: option.value
    };
  });

  return (
    <>
      <Select
        placeholder={placeholder}
        className={error ? "selectInputFormError" : "selectInputForm"}
        variant="borderless"
        optionLabelProp="label"
        {...field}
        options={optionsFormated}
        loading={loading}
        allowClear={allowClear}
        showSearch={showSearch}
        filterOption={(input, option) =>
          (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
        }
      />
      {error && (
        <Typography.Text type="danger" className="textMessageError">
          Campo es obligatorio *
        </Typography.Text>
      )}
    </>
  );
};
