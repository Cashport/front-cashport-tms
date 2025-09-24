import React from "react";
import { Control, useWatch, UseFormSetValue, UseFormTrigger } from "react-hook-form";
import { Flex } from "antd";

import MaterialSection from "./MaterialSection/MaterialSection";
import SuggestedVehicleSection from "./SuggestedVehicleSection/SuggestedVehicleSection";
import OtherServicesSection from "./OtherServicesSection/OtherServicesSection";
import PersonalSection from "./PersonalSection/PersonalSection";

import { IFormCreateOrder } from "../../CreateOrderVieww";
import { IMaterialStepOne } from "@/types/logistics/schema";

import "./loadView.scss";

interface ILoadViewProps {
  control: Control<IFormCreateOrder, any>;
  allMaterials: IMaterialStepOne[] | undefined;
  setValue: UseFormSetValue<IFormCreateOrder>;
  trigger: UseFormTrigger<IFormCreateOrder>;
}

const LoadView: React.FC<ILoadViewProps> = ({ control, allMaterials, setValue, trigger }) => {
  const typeActive = useWatch({ control, name: "typeActive" });

  return (
    <Flex vertical gap={"1.5rem"} style={{ marginBottom: "2rem" }} className="loadView">
      {typeActive !== "3" ? (
        <MaterialSection control={control} allMaterials={allMaterials} trigger={trigger} />
      ) : (
        <PersonalSection control={control} />
      )}

      <hr className="divider" />
      <SuggestedVehicleSection control={control} setValue={setValue} />
      <hr className="divider" />
      <OtherServicesSection control={control} />
    </Flex>
  );
};

export default LoadView;
