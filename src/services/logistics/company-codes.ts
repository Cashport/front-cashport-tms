import { API } from "@/utils/api/api";
import { ICompanyCode } from "@/types/logistics/schema";
import { GenericResponse } from "@/types/global/IGlobal";

export const getCompanyCodes = async (): Promise<GenericResponse<ICompanyCode[]>> => {
  try {
    const response: GenericResponse<ICompanyCode[]> = await API.get(
      `/transfer-order/all/subsidiaries`
    );
    return response;
  } catch (error) {
    console.error("Error get all company codes: ", error);
    throw error;
  }
};
