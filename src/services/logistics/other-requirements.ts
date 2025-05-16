import { Data } from "@/types/logistics/schema";
import { API } from "@/utils/api/api";

export const getOtherRequirements = async (): Promise<Data> => {
  try {
    const response: Data = await API.get(
      `/carrier/all/other-requirements`,
    );
    return response;
  } catch (error) {
    console.log("Error get all other requeiments: ", error);
    return error as any;
  }
};
