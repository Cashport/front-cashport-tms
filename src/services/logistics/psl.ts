import { GenericResponse } from "@/types/global/IGlobal";
import { API } from "@/utils/api/api";

export const getPsl = async (): Promise<GenericResponse> => {
  try {
    const response: GenericResponse = await API.get(`/transfer-order/all/psl`);
    return response;
  } catch (error) {
    console.log("Error get all other psl: ", error);
    return error as any;
  }
};
