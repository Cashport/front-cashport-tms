import { GenericResponse } from "@/types/global/IGlobal";
import { API } from "@/utils/api/api";

export const getSubsidiaries = async (): Promise<GenericResponse> => {
  try {
    const response: GenericResponse = await API.get(`/transfer-order/all/subsidiaries`);
    return response;
  } catch (error) {
    console.log("Error get all other subsidiaries: ", error);
    return error as any;
  }
};
