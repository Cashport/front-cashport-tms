import useSWR from "swr";
import { fetcher } from "@/utils/api/api";

export const useLocations = () => {
  const { data, isLoading, error } = useSWR<
    {
      id: number;
      city: string;
    }[]
  >(`/location`, fetcher, {});

  return {
    data,
    error,
    isLoading
  };
};
