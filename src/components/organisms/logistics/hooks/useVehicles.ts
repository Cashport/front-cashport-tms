import { getVehiclesByCarrierId } from "@/services/logistics/acept_carrier";
import useSWR from "swr";

export const useVehicles = (
  carrierId: number | undefined,
  transferRequestId: number | undefined
) => {
  const { data, error, isLoading, mutate } = useSWR(
    carrierId ? `/vehicle/provider-active/${carrierId}/${transferRequestId}` : null,
    () => getVehiclesByCarrierId(carrierId || 0, transferRequestId || 0),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  );

  return {
    vehicles: data?.data || [],
    isLoadingVehicles: isLoading,
    vehiclesError: error,
    reloadVehicles: mutate
  };
};
