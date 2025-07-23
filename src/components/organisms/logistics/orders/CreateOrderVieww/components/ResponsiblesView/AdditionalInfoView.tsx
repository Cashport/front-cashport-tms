import React from "react";
import { Control, Controller, UseFormSetValue } from "react-hook-form";
import { Flex } from "antd";

import BillingSection from "./BillingSection/BillingSection";
import ProductServiceLineSection from "./ProductServiceLineSection/ProductServiceLineSection";
import ContactDataSection from "./ContactDataSection/ContactDataSection";

import { IFormCreateOrder } from "../../CreateOrderVieww";

import "./additionalInfoView.scss";

interface IResponsiblesViewProps {
  control: Control<IFormCreateOrder, any>;
  setValue: UseFormSetValue<IFormCreateOrder>;
}

const AdditionalInfoView: React.FC<IResponsiblesViewProps> = ({ control, setValue }) => {
  return (
    <Flex vertical gap={"1.5rem"} style={{ marginBottom: "2rem" }} className="additionalInfoView">
      <div className="additionalInfoView__specialInstructions">
        <h3 className="subTitle">Instrucciones especiales</h3>
        <Controller
          control={control}
          name="additionalInfo.instructions"
          render={({ field }) => (
            <textarea
              {...field}
              placeholder="Escribe las instrucciones"
              className="textareaInstructions"
            />
          )}
        />
      </div>
      <ContactDataSection control={control} />
      <hr className="additionalInfoView__divider" />
      <BillingSection control={control} />
      <ProductServiceLineSection control={control} setValue={setValue} />
    </Flex>
  );
};

export default AdditionalInfoView;
