import { Data } from "@/types/countries/IListCountries";
import { API } from "@/utils/api/api";

export const getAllCountries = async (): Promise<Data> => {
  try {
    const response: Data = await API.get(`/country`);
    return response;
  } catch (error) {
    return error as any;
  }
};
