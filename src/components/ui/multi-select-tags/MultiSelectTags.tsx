import { Col, Row, Select, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import {
  ControllerRenderProps,
  FieldErrorsImpl,
  FieldValues,
  Merge,
  FieldError as OriginalFieldError
} from "react-hook-form";
import "./MultiSelectTags.scss";

interface OptionType {
  value: number;
  label: string;
}

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
  defaultValue?: OptionType[] | null;
  disabled?: boolean;
  layout?: string;
}

const MultiSelectTags = <T extends FieldValues>({
  errors,
  field,
  title,
  placeholder,
  options,
  loading = false,
  customStyleContainer,
  defaultValue,
  disabled = false,
  layout = "horizontal"
}: PropsGeneralSelect<T>) => {
  const layoutspan = layout == "horizontal" ? [6, 18] : [24, 24];
  const tagmargintop = layout == "horizontal" ? 0 : 10;

  const [selectedOptions, setSelectedOptions] = useState<OptionType[]>([]);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);

  useEffect(() => {
    if (field.value) {
      const newSelectedOptions =
        options?.filter((option) =>
          field.value.some((selected: any) => selected.value === option.value)
        ) || [];
      setSelectedOptions(newSelectedOptions);
    }

    if (Array.isArray(defaultValue) && defaultValue.length > 0 && isFirstLoad) {
      //const newSelectedOptions = defaultValue as unknown as OptionType[];
      //setSelectedOptions(newSelectedOptions);
      setIsFirstLoad(false);
      field.onChange(defaultValue);
    }
  }, [field.value, options]);

  const handleChange = (value: OptionType[]) => {
    setSelectedOptions(value);
    field.onChange(value);
  };

  const usedOptions = options?.map((option) => {
    return {
      value: option.value,
      label: option.label,
      className: "selectOptions"
    };
  });

  const handleDeleteSelected = (option: OptionType) => {
    const newSelectedOptions = selectedOptions.filter(
      (selectedOption) => selectedOption.value !== option.value
    );
    setSelectedOptions(newSelectedOptions);
    field.onChange(newSelectedOptions);
  };

  return (
    <Row gutter={16} style={{ width: "100%" }}>
      <Col span={layoutspan[0]}>
        <label className="textTitle">{title}</label>
        <Select
          {...field}
          variant="borderless"
          mode="multiple"
          tagRender={(props) => <div> {props.disabled} </div>}
          placeholder={placeholder}
          showSearch={false}
          className={errors ? "inputError" : "inputRegular"}
          style={{ width: "100%" }}
          popupClassName="selectDrop"
          loading={loading}
          optionLabelProp="label"
          value={selectedOptions}
          onChange={handleChange}
          options={usedOptions}
          defaultValue={defaultValue}
          labelInValue
        ></Select>
        {errors && (
          <Typography.Text className="textError">{title} es obligatorio *</Typography.Text>
        )}
      </Col>
      <Col
        span={layoutspan[1]}
        style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "flex-end" }}
      >
        {selectedOptions.map((option) => (
          <Tag
            key={option.value}
            closable={!disabled}
            color="#3D3D3D"
            onClose={() => handleDeleteSelected(option)}
            style={{
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 6,
              paddingBottom: 6,
              borderRadius: 8,
              marginTop: tagmargintop
            }}
          >
            {option.label}
          </Tag>
        ))}
      </Col>
    </Row>
  );
};

export default MultiSelectTags;
