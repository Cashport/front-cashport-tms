import React from "react";
import { Control } from "react-hook-form";
import { Flex } from "antd";

import MaterialSection from "./MaterialSection/MaterialSection";
import SuggestedVehicleSection from "./SuggestedVehicleSection/SuggestedVehicleSection";

import { IFormCreateOrder } from "../../CreateOrderVieww";

import "./loadView.scss";

interface ILoadViewProps {
  control: Control<IFormCreateOrder, any>;
}

const LoadView: React.FC<ILoadViewProps> = ({ control }) => {
  return (
    <Flex vertical gap={"1.5rem"} style={{ marginBottom: "2rem" }} className="loadView">
      <MaterialSection control={control} />
      <hr className="divider" />
      <SuggestedVehicleSection control={control} />
    </Flex>
  );
};

export default LoadView;
