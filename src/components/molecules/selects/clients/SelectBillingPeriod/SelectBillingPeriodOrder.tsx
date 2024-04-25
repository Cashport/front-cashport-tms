import { Flex, Select, Typography } from "antd";
import { Dispatch, SetStateAction } from "react";

import "../commonInputStyles.scss";
import { IBillingPeriodForm } from "@/types/billingPeriod/IBillingPeriod";

interface Props {
  titleSelect?: string;
  placeHolder?: string;
  errors: any;
  field?: any;
  options: any[];
  orderRadioValue: IBillingPeriodForm;
  setValueSelected: Dispatch<SetStateAction<IBillingPeriodForm>>;
}
const { Option } = Select;
export const SelectBillingPeriodOrder = ({
  titleSelect = "",
  placeHolder = "",
  errors,
  options = [],
  orderRadioValue,
  setValueSelected
}: Props) => {
  const onChangeSelect = (value: string) => {
    setValueSelected({ ...orderRadioValue, order: value });
  };
  return (
    <Flex vertical style={{ width: "100%" }}>
      {titleSelect.length > 0 && <Typography.Title level={5}>{titleSelect}</Typography.Title>}
      <Select
        placeholder={titleSelect.length > 0 ? titleSelect : placeHolder}
        className={errors ? "selectInputCustomError" : "selectInputCustom"}
        variant="borderless"
        optionLabelProp="label"
        onChange={onChangeSelect}
      >
        {options?.map((value) => {
          return (
            <Option value={value} key={value}>
              {value}
            </Option>
          );
        })}
        {errors && (
          <Typography.Text className="textError">El orden es obligatorio *</Typography.Text>
        )}
      </Select>
    </Flex>
  );
};
