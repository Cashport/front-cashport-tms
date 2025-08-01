import { getDriverByCarrierId } from "@/services/logistics/acept_carrier";
import useSWR from "swr";

export const useDrivers = (carrierId: number | undefined) => {
  const { data, error, isLoading, mutate } = useSWR(
    carrierId ? `/driver/provider-active/${carrierId}` : null,
    () => getDriverByCarrierId(carrierId || 0),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  );

  return {
    drivers: data?.data || [],
    isLoadingDrivers: isLoading,
    driversError: error,
    reloadDrivers: mutate
  };
};
