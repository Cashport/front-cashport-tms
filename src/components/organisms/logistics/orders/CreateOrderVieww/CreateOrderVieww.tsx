import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Dayjs } from "dayjs";
import { Button, Flex, message } from "antd";

import { mapFormToTransferOrder } from "./CreateOrderVieww.mapper";
import { addTransferOrderNew } from "@/services/logistics/transfer-orders";

import Container from "@/components/atoms/Container/Container";
import { CustomStepper } from "@/components/atoms/CustomStepper/CustomStepper";
import SchedulingView from "./components/SchedulingView/SchedulingView";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import LoadView from "./components/LoadView/LoadView";
import AdditionalInfoView from "./components/ResponsiblesView/AdditionalInfoView";

import {
  IClient,
  ICompanyCode,
  ICostCenter,
  IGetAllPeople,
  IGetPSL,
  IMaterialStepOne,
  IRoute,
  ISuggestedVehicle
} from "@/types/logistics/schema";
import { IOtherRequirement } from "@/services/logistics/other-requirements";

import "./createOrderView.scss";

type ITripForm = {
  placeId?: number;
  placeName?: string;
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

export type IPeopleForm = {
  [K in keyof IGetAllPeople]?: IGetAllPeople[K];
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

interface IContactsPerLocation {
  contacts: {
    contact_phone?: string;
    contact_name?: string;
  }[];
  location_id?: number;
  locationName?: string;
}

interface IAdditionalInfoForm {
  contactsPerLocation: IContactsPerLocation[];
  instructions?: string;
}

interface IBillingForm {
  companyCode?: ICompanyCode;
  endClient?: IClient;
}

export type ICostCenterForm = {
  selectedCostCenter?: ICostCenter;
  percentage?: number;
};
export interface IPSLGeneral {
  selectedPSL?: IGetPSL;
  percentagePSL?: number;
  costCenters?: ICostCenterForm[]; // Lista de centros de costos seleccionados
}

interface IProductServiceLineForm {
  productServiceLine?: IPSLGeneral[];
}

export interface IFormCreateOrder {
  typeActive?: string; // "1" | "2" | "3" | "4"
  TripDetails: ITripForm[]; // [Origen, ...paradas, Destino]
  geometry: IRoute[]; // en el submit se manda  todo esto
  material?: IMaterialForm[];
  people?: IPeopleForm[];
  suggestedVehicle?: ISuggestedVehicleForm[];
  otherServices?: IOtherServicesForm[];
  additionalInfo?: IAdditionalInfoForm;
  billing?: IBillingForm;
  productServiceLine?: IProductServiceLineForm;
}

export type IViewOption = "scheduling" | "load" | "additionalInfo";

export const CreateOrderVieww: React.FC = () => {
  const [view, setView] = useState<IViewOption>("scheduling");
  const [loadingRequest, setLoadingRequest] = useState<boolean>(false);

  const { push } = useRouter();

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
      ],
      material: [
        {
          id: undefined,
          quantity: 1
        }
      ],
      suggestedVehicle: [
        {
          id: undefined,
          quantity: 1
        }
      ],
      productServiceLine: {
        productServiceLine: [
          {
            selectedPSL: undefined,
            percentagePSL: 0,
            costCenters: [{ selectedCostCenter: undefined }]
          }
        ]
      }
    }
  });

  // watchTripType
  const tripType = watch("typeActive");
  // Watch the TripDetails to see if any changes are made
  const tripDetails = watch("TripDetails");

  // watch Load form values
  const materialDetails = watch("material");
  const suggestedVehicles = watch("suggestedVehicle");
  const otherServices = watch("otherServices");
  const additionalInfo = watch("additionalInfo");
  const billing = watch("billing");
  const productServiceLine = watch("productServiceLine");

  const currentStepIndex = stepIndexMap[view] ?? stepIndexMap.default;

  const renderView = (currentView: IViewOption) => {
    switch (currentView) {
      case "scheduling":
        return <SchedulingView control={control} setValue={setValue} />;
      case "load":
        return <LoadView control={control} />;
      case "additionalInfo":
        return <AdditionalInfoView control={control} setValue={setValue} />;
      default:
        return null;
    }
  };

  const onSubmit = async (data: IFormCreateOrder) => {
    console.info("Submitting data:", data);
    switch (view) {
      case "scheduling":
        setView("load");
        break;
      case "load":
        setView("additionalInfo");

        break;
      case "additionalInfo":
        // TO DO: Determine wheter an api call is needed here or not
        // Also, we need to leave the data in the zustand store to be used later
        // setLoadingRequest(true);
        // const modeledData = mapFormToTransferOrder(data);
        // console.log("Modeled data for transfer order:", modeledData);

        // try {
        //   const res = await addTransferOrderNew(modeledData, []);
        //   console.log("Response from addTransferOrderNew:", res);

        //   message.success(`TO No. ${res.id} ha sido creada`, 2, () =>
        //     push("/logistics/orders/details/" + res.id)
        //   );
        // } catch (error) {
        //   message.error("Error al crear la orden de transferencia", 2);
        //   console.error("Error adding transfer order:", error);
        // }
        // setLoadingRequest(false);

        setLoadingRequest(true);
        // Change route to the details page
        push("/logistics/orders/milkyWIP");
        break;
      default:
        console.error("Unknown view:", view);
    }
  };

  const isNextButtonDisabled = useMemo(() => {
    // for every view we check if the next button should be disabled
    switch (view) {
      case "scheduling":
        const isDestinationDateAndTimeMandatory = tripType === "4";

        if (isDestinationDateAndTimeMandatory) {
          const isValid = tripDetails.every(
            (detail) => detail.placeId && detail.date && detail.time
          );
          return !isValid;
        }
        // aca solo verificamos que la primera ubicación tenga todo y haya un destino
        const isValid =
          tripDetails[0].placeId &&
          tripDetails[0].date &&
          tripDetails[0].time &&
          tripDetails[1].placeId;
        return !isValid;
      case "load":
        // at least one material and vehicle must be selected
        // if there is a row should have something selected, an id
        const validMaterial =
          materialDetails &&
          materialDetails?.length > 0 &&
          materialDetails?.every((detail) => detail.id !== undefined);

        const validVehicles =
          suggestedVehicles &&
          suggestedVehicles?.length > 0 &&
          suggestedVehicles?.every((vehicle) => vehicle.id !== undefined);

        const validOtherServices = otherServices?.every((service) => service.id !== undefined);

        return !validMaterial || !validVehicles || !validOtherServices;
      case "additionalInfo":
        const validAdditionalInfo =
          additionalInfo &&
          additionalInfo.contactsPerLocation.length > 0 &&
          additionalInfo.contactsPerLocation.every(
            (contact) =>
              contact.contacts.length > 0 &&
              contact.contacts.every(
                (c) => c.contact_phone && c.contact_name && c.contact_phone.trim() !== ""
              )
          );

        const validBilling = billing && billing.companyCode && billing.endClient;

        const validProductServiceLine =
          productServiceLine?.productServiceLine &&
          productServiceLine.productServiceLine.length > 0 &&
          productServiceLine.productServiceLine.every((psl) => {
            return (
              psl.selectedPSL !== undefined &&
              psl.percentagePSL &&
              psl.percentagePSL > 0 &&
              psl.costCenters &&
              psl.costCenters.length > 0 &&
              psl.costCenters.every((costCenter) => costCenter.selectedCostCenter !== undefined) &&
              psl.costCenters.every(
                (costCenter) => costCenter.percentage && costCenter.percentage > 0
              )
            );
          });

        return !validAdditionalInfo || !validBilling || !validProductServiceLine;
      default:
        return false;
    }

    // Forces React to recalculate useMemo whenever any data changes, even if the reference doesn't.
  }, [
    JSON.stringify(tripDetails),
    view,
    JSON.stringify(materialDetails),
    JSON.stringify(suggestedVehicles),
    JSON.stringify(otherServices),
    JSON.stringify(additionalInfo),
    JSON.stringify(billing),
    JSON.stringify(productServiceLine),
    tripType
  ]);

  const getPreviousView = (currentView: IViewOption): IViewOption | null => {
    const viewsOrder: IViewOption[] = ["scheduling", "load", "additionalInfo"];
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
          loading={loadingRequest}
          onClick={handleSubmit(onSubmit)}
        >
          Siguiente
        </PrincipalButton>
      </div>
    </div>
  );
};
const stepIndexMap: Record<string, number> = {
  scheduling: 0,
  load: 1,
  additionalInfo: 2
};

const steps = [{ title: "Agendamiento" }, { title: "Carga" }, { title: "Información adicional" }];
