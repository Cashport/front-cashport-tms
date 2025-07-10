import React from "react";
import { Control, UseFormSetValue } from "react-hook-form";
import { Flex } from "antd";

import AdditionalInfoSection from "./AdditionalInfoSection/AdditionalInfoSection";
import BillingSection from "./BillingSection/BillingSection";
import ProductServiceLineSection from "./ProductServiceLineSection/ProductServiceLineSection";

import { IFormCreateOrder } from "../../CreateOrderVieww";

import "./responsiblesView.scss";

interface IResponsiblesViewProps {
  control: Control<IFormCreateOrder, any>;
  setValue: UseFormSetValue<IFormCreateOrder>;
}

const ResponsiblesView: React.FC<IResponsiblesViewProps> = ({ control, setValue }) => {
  return (
    <Flex vertical gap={"1.5rem"} style={{ marginBottom: "2rem" }} className="responsiblesView">
      <AdditionalInfoSection control={control} />
      <hr className="divider" />
      <BillingSection control={control} />
      <ProductServiceLineSection control={control} setValue={setValue} />
    </Flex>
  );
};

export default ResponsiblesView;
