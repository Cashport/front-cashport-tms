import { IListCurrencies } from "@/types/currencies/IListCurrencies";
import { API } from "@/utils/api/api";

export const getAllCurrencies = async (): Promise<IListCurrencies> => {
  try {
    const response: IListCurrencies = await API.get(`/currency`);
    return response;
  } catch (error) {
    return error as any;
  }
};
