"use client";
import { transferOrderMerge } from "@/services/logistics/transfer-request";
import { message, Spin } from "antd";
import useSWR from "swr/immutable";
import PricingTransferRequest from "../PricingTransferRequest";
import { MODE_PRICING } from "../constant/constants";
import { useRouter } from "next/navigation";

export default function MergeTRFetcher({ transferOrders }: { transferOrders: number[] }) {
  const router = useRouter();
  const { data, isLoading, isValidating } = useSWR(
    { transferOrders },
    ({ transferOrders }) => transferOrderMerge(transferOrders),
    {
      onError: (error) => {
        if (error instanceof Error) message.error(error.message);
        console.error("error", error);
        router.push("/logistics/transfer-orders");
      }
    }
  );
  if (isLoading || !data || isValidating) return <Spin />;
  return (
    <PricingTransferRequest
      data={{ stepOne: { transferOrders: data.orders } }}
      mode={MODE_PRICING.MERGE}
      mutateStepthree={() => {}}
      tracking={data.tracking}
    />
  );
}
