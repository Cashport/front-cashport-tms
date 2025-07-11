import { GenericResponse } from "@/types/global/IGlobal";
import { IGetPSL } from "@/types/logistics/schema";
import { API } from "@/utils/api/api";

export const getPsl = async (): Promise<GenericResponse<IGetPSL[]>> => {
  try {
    const response: GenericResponse<IGetPSL[]> = await API.get(`/transfer-order/all/psl`);
    return response;
  } catch (error) {
    console.error("Error get all other psl: ", error);
    throw error;
  }
};
