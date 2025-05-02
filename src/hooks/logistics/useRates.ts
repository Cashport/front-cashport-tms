import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";

export const useRates = () => {
  const { data, isLoading, error } = useSWR<
    GenericResponse<
      {
        active: boolean;
        id: number;
        description: string;
      }[]
    >
  >(`/pricing/pricing-type`, fetcher, {});

  return {
    data: data?.data,
    error,
    isLoading
  };
};
