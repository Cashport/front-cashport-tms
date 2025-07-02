/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";

import { Flex } from "antd";
import Container from "@/components/atoms/Container/Container";

import "./createOrderView.scss";
import { CustomStepper } from "@/components/atoms/CustomStepper/CustomStepper";

export const CreateOrderVieww: React.FC = () => {
  const [view, setView] = useState<"scheduling" | "load" | "responsibles">("scheduling");

  const currentStepIndex = stepIndexMap[view] ?? stepIndexMap.default;

  const renderView = (currentView: "scheduling" | "load" | "responsibles") => {
    switch (currentView) {
      case "scheduling":
        return <div>Scheduling View</div>;
      case "load":
        return <div>Load View</div>;
      case "responsibles":
        return <div>Responsibles View</div>;
      default:
        return null;
    }
  };

  return (
    <Container>
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
