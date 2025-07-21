import { API } from "@/utils/api/api";
import { Data, ISuggestedVehicle } from "@/types/logistics/schema";
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
