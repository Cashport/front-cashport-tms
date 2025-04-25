import React from "react";
import { Select, Flex, Typography } from "antd";
import { Control, Controller, FieldError, RegisterOptions } from "react-hook-form";
import type { SelectProps } from "antd";

import "./inputSelect.scss";

interface Option {
  value: string | number;
  label: string;
}

interface InputSelectProps {
  titleInput: string;
  nameInput: string;
  control: Control<any> | undefined;
  error: FieldError | undefined;
  options: Option[];
  hiddenTitle?: boolean;
  placeholder?: string;
  disabled?: boolean;
  validationRules?: RegisterOptions;
  className?: string;
  loading?: boolean;
  isError?: boolean;
  noRequired?: boolean;
  showSearch?: boolean;
  filterOption?: SelectProps['filterOption'];
}

export const InputSelect = ({
  titleInput,
  nameInput,
  control,
  error,
  options,
  hiddenTitle = false,
  placeholder = "",
  disabled,
  validationRules,
  noRequired = false,
  className,
  loading = false,
  isError = false,
  showSearch = false,
  filterOption
}: InputSelectProps) => {
  return (
    <Flex vertical className={`selectContainer ${className}`}>
      {!hiddenTitle && <p className="select-form-title">{titleInput}</p>}
      <Controller
        name={nameInput}
        rules={{ required: !noRequired, ...validationRules }}
        control={control}
        render={({ field }) => {
          if (isError) {
            return <Typography.Text type="danger">Error al cargar las opciones</Typography.Text>;
          }
          return (
            <Select
              {...field}
              placeholder={placeholder || `Select ${titleInput.toLowerCase()}`}
              className={error ? "selectInputError" : "selectInput"}
              loading={loading}
              disabled={disabled}
              onChange={(value) => field.onChange(value)}
              value={field.value}
              showSearch={showSearch}
              filterOption={filterOption}
            >
              {options.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          );
        }}
      />
      {error && (
        <Typography.Text className="textError">
          {error.message || `${titleInput} is required`}
        </Typography.Text>
      )}
    </Flex>
  );
};
