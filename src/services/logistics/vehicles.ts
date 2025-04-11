import { API } from "@/utils/api/api";
import { Data } from "@/types/logistics/schema";

export const getSuggestedVehicles = async (typeOfServiceId: string): Promise<Data> => {
  try {
    const body = { id: typeOfServiceId };
    const response: Data = await API.post(`/vehicle/suggested`, body);
    return response;
  } catch (error) {
    console.log("Error creating new location: ", error);
    return error as any;
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
