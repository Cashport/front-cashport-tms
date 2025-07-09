import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Flex } from "antd";
import { Dayjs } from "dayjs";

import Container from "@/components/atoms/Container/Container";
import { CustomStepper } from "@/components/atoms/CustomStepper/CustomStepper";
import SchedulingView from "./components/SchedulingView/SchedulingView";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import LoadView from "./components/LoadView/LoadView";

import { IMaterialStepOne, IRoute, ISuggestedVehicle } from "@/types/logistics/schema";
import { IOtherRequirement } from "@/services/logistics/other-requirements";

import "./createOrderView.scss";

type ITripForm = {
  placeId?: number;
  date?: Dayjs;
  time?: Dayjs;
  requiresRaising?: boolean;
  raisingNum?: number;
};

type IMaterialForm = {
  [K in keyof IMaterialStepOne]?: IMaterialStepOne[K];
} & {
  quantity: number;
};

type ISuggestedVehicleForm = {
  [K in keyof ISuggestedVehicle]?: ISuggestedVehicle[K];
} & {
  quantity: number;
  usedPercentage?: number;
};

type IOtherServicesForm = {
  [K in keyof IOtherRequirement]?: IOtherRequirement[K];
} & {
  quantity: number;
};

export interface IFormCreateOrder {
  typeActive?: string; // "1" | "2" | "3"
  TripDetails: ITripForm[]; // [Origen, ...paradas, Destino]
  geometry: IRoute[]; // en el submit se manda  todo esto
  material: IMaterialForm[];
  suggestedVehicle: ISuggestedVehicleForm[];
  otherServices?: IOtherServicesForm[];
}

export type IViewOption = "scheduling" | "load" | "responsibles";

export const CreateOrderVieww: React.FC = () => {
  const [view, setView] = useState<IViewOption>("scheduling");

  const { control, handleSubmit, setValue, watch } = useForm<IFormCreateOrder>({
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

  // Watch the TripDetails to see if any changes are made
  const tripDetails = watch("TripDetails");

  // watch Load form values
  const materialDetails = watch("material");
  const suggestedVehicles = watch("suggestedVehicle");
  const otherServices = watch("otherServices");

  const currentStepIndex = stepIndexMap[view] ?? stepIndexMap.default;

  const renderView = (currentView: IViewOption) => {
    switch (currentView) {
      case "scheduling":
        return <SchedulingView control={control} setValue={setValue} />;
      case "load":
        return <LoadView control={control} />;
      case "responsibles":
        return <div>Responsibles View</div>;
      default:
        return null;
    }
  };

  const onSubmit = (data: IFormCreateOrder) => {
    console.log("Form submitted with data:", data);
    switch (view) {
      case "scheduling":
        console.log("Scheduling view data:", data);
        setView("load");
        break;
      case "load":
        console.log("Load view data:", data);
        // setView("responsibles");

        break;
      case "responsibles":
        console.log("Responsibles view data:", data);

        break;
      default:
        console.error("Unknown view:", view);
    }
  };

  const isNextButtonDisabled = useMemo(() => {
    // for every view we check if the next button should be disabled
    switch (view) {
      case "scheduling":
        const isValid = tripDetails.every((detail) => detail.placeId && detail.date && detail.time);
        return !isValid;
      case "load":
        // at least one material and vehicle must be selected
        // if there is a row should have something selected, an id
        const validMaterial =
          materialDetails.length > 0 && materialDetails.every((detail) => detail.id !== undefined);

        const validVehicles =
          suggestedVehicles.length > 0 &&
          suggestedVehicles?.every((vehicle) => vehicle.id !== undefined);

        const validOtherServices = otherServices?.every((service) => service.id !== undefined);

        return !validMaterial || !validVehicles || !validOtherServices;
      case "responsibles":
        return false;
      default:
        return false;
    }

    // Forces React to recalculate useMemo whenever tripDetails changes, even if the reference doesn't.
  }, [
    JSON.stringify(tripDetails),
    view,
    JSON.stringify(materialDetails),
    JSON.stringify(suggestedVehicles),
    JSON.stringify(otherServices)
  ]);

  const getPreviousView = (currentView: IViewOption): IViewOption | null => {
    const viewsOrder: IViewOption[] = ["scheduling", "load", "responsibles"];
    const currentIndex = viewsOrder.indexOf(currentView);
    if (currentIndex > 0) {
      return viewsOrder[currentIndex - 1];
    }
    return null; // Ya está en la primera vista
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

      <div className="footerButtons">
        {view !== "scheduling" && (
          <Button className="backButton" onClick={() => setView(getPreviousView(view)!)}>
            Atrás
          </Button>
        )}

        <PrincipalButton
          className="nextButton"
          disabled={isNextButtonDisabled}
          onClick={handleSubmit(onSubmit)}
        >
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
