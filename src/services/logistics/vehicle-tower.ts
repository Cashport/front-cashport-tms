import { GenericResponse } from "@/types/global/IGlobal";
import { API } from "@/utils/api/api";
import { MAP_V2_SOURCE } from "@/utils/constants/featureFlags";
import type {
  IApiFleet,
  IApiHistory,
  IApiTripDetail
} from "@/modules/logistics/vehicle-tower/types/vehicleTowerApi";

const loadMock = () => import("@/modules/logistics/vehicle-tower/mocks/mockApi");

export const getVehicleTower = async (): Promise<IApiFleet> => {
  if (MAP_V2_SOURCE === "mock") return (await loadMock()).getMockFleet(new Date());
  const response: GenericResponse<IApiFleet> = await API.get("/vehicle-tower");
  return response.data;
};

export const getVehicleTowerTrip = async (tripId: number): Promise<IApiTripDetail> => {
  if (MAP_V2_SOURCE === "mock") return (await loadMock()).getMockTripDetail(tripId, new Date());
  const response: GenericResponse<IApiTripDetail> = await API.get(`/vehicle-tower/${tripId}`);
  return response.data;
};

export const getVehicleTowerHistory = async (from: number, to: number): Promise<IApiHistory> => {
  if (MAP_V2_SOURCE === "mock") return (await loadMock()).getMockHistory(from, to, new Date());
  const params = new URLSearchParams({
    from: new Date(from).toISOString(),
    to: new Date(to).toISOString()
  });
  const response: GenericResponse<IApiHistory> = await API.get(`/vehicle-tower/history?${params}`);
  return response.data;
};
