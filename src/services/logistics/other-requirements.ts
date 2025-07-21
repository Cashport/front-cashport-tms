import { GenericResponse } from "@/types/global/IGlobal";
import { API } from "@/utils/api/api";

export interface IOtherRequirement {
  id: number;
  description: string;
}

export const getOtherRequirements = async (): Promise<GenericResponse<IOtherRequirement[]>> => {
  try {
    const response: GenericResponse<IOtherRequirement[]> = await API.get(
      `/carrier/all/other-requirements`
    );
    return response;
  } catch (error) {
    console.log("Error get all other requeiments: ", error);
    return error as any;
  }
};
