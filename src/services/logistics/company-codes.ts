import { API } from "@/utils/api/api";
import { Data } from "@/types/logistics/schema";

export const getCompanyCodes = async (): Promise<Data> => {
  try {
    const response: Data = await API.get(`/transfer-order/all/subsidiaries`);
    return response;
  } catch (error) {
    console.log("Error get all other requeiments: ", error);
    return error as any;
  }
};
