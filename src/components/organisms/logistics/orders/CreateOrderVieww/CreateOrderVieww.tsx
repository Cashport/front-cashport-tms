import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Flex } from "antd";
import { Dayjs } from "dayjs";

import Container from "@/components/atoms/Container/Container";
import { CustomStepper } from "@/components/atoms/CustomStepper/CustomStepper";
import SchedulingView from "./components/SchedulingView/SchedulingView";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";

import { IRoute } from "@/types/logistics/schema";

import "./createOrderView.scss";

type ITripForm = {
  placeId?: number;
  date?: Dayjs;
  time?: Dayjs;
  requiresRaising?: boolean;
  raisingNum?: number;
};

export interface IFormCreateOrder {
  TripDetails: ITripForm[]; // [Origen, ...paradas, Destino]
  geometry: IRoute[]; // en el submit se manda  todo esto
}

export type IViewOption = "scheduling" | "load" | "responsibles";

export const CreateOrderVieww: React.FC = () => {
  const [view, setView] = useState<IViewOption>("scheduling");

  const { control, handleSubmit, setValue } = useForm<IFormCreateOrder>({
    defaultValues: {
      TripDetails: [
        {
          placeId: undefined,
          date: undefined,
          time: undefined,
          requiresRaising: false,
          raisingNum: 0
        }, // Origen
        {
          placeId: undefined,
          date: undefined,
          time: undefined,
          requiresRaising: false,
          raisingNum: 0
        } // Destino
      ]
    }
  });

  const currentStepIndex = stepIndexMap[view] ?? stepIndexMap.default;

  const renderView = (currentView: IViewOption) => {
    switch (currentView) {
      case "scheduling":
        return <SchedulingView setView={setView} control={control} setValue={setValue} />;
      case "load":
        return <div>Load View</div>;
      case "responsibles":
        return <div>Responsibles View</div>;
      default:
        return null;
    }
  };

  const onSubmit = (data: IFormCreateOrder) => {
    console.log("Form submitted with data:", data);
    // Aquí puedes manejar el envío del formulario, como llamar a una API o actualizar el estado global
  };

  return (
    <div className="createOrderView">
      <Container customStyles={{ height: "auto" }}>
        <Flex vertical>
          {/* ------------Main Info Order-------------- */}
          <CustomStepper steps={steps} currentStepIndex={currentStepIndex} />
          <hr className="separator" />
          {renderView(view)}
        </Flex>
      </Container>

      <div className="nextButton">
        <PrincipalButton onClick={handleSubmit(onSubmit)}>
          {view !== "responsibles" ? "Siguiente" : "Confirmar"}
        </PrincipalButton>
      </div>
    </div>
  );
};
const stepIndexMap: Record<string, number> = {
  scheduling: 0,
  load: 1,
  responsibles: 2
};

const steps = [{ title: "Agendamiento" }, { title: "Carga" }, { title: "Responsables" }];
