import { ITransferRequestJourneyReview, TripCarriersPricing } from "@/types/logistics/schema";
import { Flex } from "antd";
import JourneyCollapse from "../journeyCollapse/JourneyCollapse";
import { useState } from "react";
import TripCarrierPricing from "../trip/TripCarrierPricing";
import style from "./PricingStepThree.module.scss";
import { Control, useFieldArray } from "react-hook-form";
import {
  CarrierPricingFinish,
  TransferRequestFinish
} from "@/types/logistics/transferRequest/transferRequest";
import { STATUS } from "@/utils/constants/globalConstants";

type Props = {
  data: {
    journey?: ITransferRequestJourneyReview[];
  };
  control: Control<TransferRequestFinish, any>;
};
export default function PricingStepThree({ data, control }: Props) {
  const { fields, append, update } = useFieldArray({
    control,
    name: "providers"
  });
  const handleSelectCarrier = (cp: CarrierPricingFinish) => {
    if (
      !data?.journey?.some((j) =>
        j.trips.some((t) =>
          t.carriers_pricing.some(
            (c) => c.id === cp.id_carrier_request && c.status === STATUS.CR.EN_REVISÓN
          )
        )
      )
    )
      return;
    const index = fields.findIndex((a) => a.id_trip === cp.id_trip);
    if (index === -1) {
      append(cp);
    } else {
      update(index, cp);
    }
  };
  const [openTabs, setOpenTabs] = useState<number[]>(data.journey?.map((_, i) => i) || []);
  const tag = ({ trips }: { trips: TripCarriersPricing[] }) => (
    <Flex gap={24} vertical className={style.tripCarrierPricing}>
      {trips.map((trip, index) => (
        <TripCarrierPricing
          key={`trip-${index}-${trip.id_trip}`}
          trip={trip}
          handleSelectCarrier={handleSelectCarrier}
          fields={fields}
        />
      ))}
    </Flex>
  );
  return (
    <Flex gap={24} vertical>
      {data.journey?.map((journey, index) => {
        return (
          <JourneyCollapse
            key={index}
            index={index}
            id_type_service={journey.service_type}
            start_location_desc={journey.start_location_desc}
            end_location_desc={journey.end_location_desc}
            openTabs={openTabs}
            setOpenTabs={setOpenTabs}
            tag={tag({ trips: journey.trips })}
          />
        );
      })}
    </Flex>
  );
}
