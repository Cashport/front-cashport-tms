import { NO_REVALIDATE } from "@/enums/rates";
import { getAllGroupByLocation, getAllLocationTypes } from "@/services/logistics/locations";
import useSWR from "swr";

export function useCarrierFormTabTypes() {
  const { data: locationTypes, isLoading: isloadingTripTypes } = useSWR(
    "carrier",
    getAllLocationTypes,
    NO_REVALIDATE
  );
  const { data: groupLocations, isLoading: isloadingGroupLocations } = useSWR(
    "groupLocations",
    getAllGroupByLocation,
    NO_REVALIDATE
  );
  const availableCommunityCarrierTypes = [2, 3];

  return {
    locationTypes,
    isloadingTripTypes,
    groupLocations,
    isloadingGroupLocations,
    availableCommunityCarrierTypes
  };
}
