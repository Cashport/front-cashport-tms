import { API } from "@/utils/api/api";
import {
  Data,
  IMaterialsRequest,
  ISuggestedVehicle,
  ISuggestedVehiclesByMaterials
} from "@/types/logistics/schema";
import { GenericResponse } from "@/types/global/IGlobal";

export const getSuggestedVehicles = async (
  typeOfServiceId?: string
): Promise<GenericResponse<ISuggestedVehicle[]>> => {
  // If no typeOfServiceId is provided returns all suggested vehicles
  try {
    const body = { id: typeOfServiceId };
    const response: GenericResponse<ISuggestedVehicle[]> = await API.post(
      `/vehicle/suggested`,
      body
    );
    return response;
  } catch (error) {
    console.log("Error creating new location: ", error);
    throw error;
  }
};

export const getVehicleById = async (id: string): Promise<Data> => {
  try {
    const response: Data = await API.get(`/vehicle/${id}`);
    console.log(response);
    return response;
  } catch (error) {
    console.log("Error: ", error);
    return error as any;
  }
};

export const getSuggestedVehiclesByMaterials = async (
  materials: IMaterialsRequest
): Promise<GenericResponse<ISuggestedVehiclesByMaterials>> => {
  try {
    const response: GenericResponse<ISuggestedVehiclesByMaterials> = await API.post(
      `/material/calculate`,
      {
        materials
      }
    );
    return response;
  } catch (error) {
    console.log("Error fetching suggested vehicles by materials: ", error);
    throw error;
  }
};
