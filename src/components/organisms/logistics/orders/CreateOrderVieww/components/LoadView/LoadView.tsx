import React from "react";
import { Control, useWatch } from "react-hook-form";
import { Flex } from "antd";

import MaterialSection from "./MaterialSection/MaterialSection";
import SuggestedVehicleSection from "./SuggestedVehicleSection/SuggestedVehicleSection";
import OtherServicesSection from "./OtherServicesSection/OtherServicesSection";
import PersonalSection from "./PersonalSection/PersonalSection";

import { IFormCreateOrder } from "../../CreateOrderVieww";

import "./loadView.scss";

interface ILoadViewProps {
  control: Control<IFormCreateOrder, any>;
}

const LoadView: React.FC<ILoadViewProps> = ({ control }) => {
  const typeActive = useWatch({ control, name: "typeActive" });

  return (
    <Flex vertical gap={"1.5rem"} style={{ marginBottom: "2rem" }} className="loadView">
      {typeActive !== "3" ? (
        <MaterialSection control={control} />
      ) : (
        <PersonalSection control={control} />
      )}

      <hr className="divider" />
      <SuggestedVehicleSection control={control} />
      <hr className="divider" />
      <OtherServicesSection control={control} />
    </Flex>
  );
};

export default LoadView;
