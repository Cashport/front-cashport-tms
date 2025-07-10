import React from "react";
import { Control } from "react-hook-form";
import { Flex } from "antd";

import AdditionalInfoSection from "./AdditionalInfoSection/AdditionalInfoSection";
import BillingSection from "./BillingSection/BillingSection";
import ProductServiceLineSection from "./ProductServiceLineSection/ProductServiceLineSection";

import { IFormCreateOrder } from "../../CreateOrderVieww";

import "./responsiblesView.scss";

interface IResponsiblesViewProps {
  control: Control<IFormCreateOrder, any>;
}

const ResponsiblesView: React.FC<IResponsiblesViewProps> = ({ control }) => {
  return (
    <Flex vertical gap={"1.5rem"} style={{ marginBottom: "2rem" }} className="responsiblesView">
      <AdditionalInfoSection control={control} />
      <hr className="divider" />
      <BillingSection control={control} />
      <ProductServiceLineSection control={control} />
    </Flex>
  );
};

export default ResponsiblesView;
