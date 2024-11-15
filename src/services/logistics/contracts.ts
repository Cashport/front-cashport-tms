import { VehicleRate } from "@/types/contracts/contractsTypes";
import { GenericResponse } from "@/types/global/IGlobal";
import { API } from "@/utils/api/api";

export const getAllVehiclesRates = async (): Promise<VehicleRate[]> => {
  const response: GenericResponse<VehicleRate[]> = await API.get(`/contract/contracts-pricing`);
  console.log("getAllVehiclesRates", response.data);
  return response?.data || [];
};
