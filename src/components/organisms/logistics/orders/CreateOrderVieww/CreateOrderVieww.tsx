import React, { useState } from "react";
import { Flex } from "antd";

import Container from "@/components/atoms/Container/Container";
import { CustomStepper } from "@/components/atoms/CustomStepper/CustomStepper";
import SchedulingView from "./components/SchedulingView/SchedulingView";

import "./createOrderView.scss";

export type IViewOption = "scheduling" | "load" | "responsibles";

export const CreateOrderVieww: React.FC = () => {
  const [view, setView] = useState<IViewOption>("scheduling");

  const currentStepIndex = stepIndexMap[view] ?? stepIndexMap.default;

  const renderView = (currentView: IViewOption) => {
    switch (currentView) {
      case "scheduling":
        return <SchedulingView setView={setView} />;
      case "load":
        return <div>Load View</div>;
      case "responsibles":
        return <div>Responsibles View</div>;
      default:
        return null;
    }
  };

  return (
    <Container customStyles={{ height: "auto" }}>
      <Flex vertical className="createOrderView">
        {/* ------------Main Info Order-------------- */}
        <CustomStepper steps={steps} currentStepIndex={currentStepIndex} />
        <hr className="separator" />
        {renderView(view)}
      </Flex>
    </Container>
  );
};
const stepIndexMap: Record<string, number> = {
  scheduling: 0,
  load: 1,
  responsibles: 2
};

const steps = [{ title: "Agendamiento" }, { title: "Carga" }, { title: "Responsables" }];
