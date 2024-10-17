import { Select, Typography } from "antd";

import "./SelectVehicleType.scss";

interface Props {
  errors: any;
  field: any;
  selected?: any;
  options: any;
  loading: boolean;
}

export const SelectVehicleType = ({ errors, field, selected, options, loading }: Props) => {
  return (
    <>
      <Select
        placeholder="Selecciona Tipo de Vehículo"
        className={
          errors?.general?.currencies ? "selectInputCurrenciesError" : "selectInputCurrencies"
        }
        variant="borderless"
        optionLabelProp="label"
        {...field}
        options={options}
        loading={loading}
      />
      {errors?.general?.rh && (
        <Typography.Text className="textError">Campo es obligatorio *</Typography.Text>
      )}
    </>
  );
};
