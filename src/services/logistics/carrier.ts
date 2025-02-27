import axios from "axios";
import config from "@/config";
import { IAPIDriver, IListData } from "@/types/logistics/schema";
import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";

export const getAllCarriers = async (): Promise<any> => {
    const response: GenericResponse = await API.get(`/carrier/all`);
    if (response.success) return response.data;
    else throw response;
};

export const getCarrierById = async (id: string): Promise<IListData> => {
  try {
    const response: IListData = await API.get(`/carrier/${id}`);
    return response;
  } catch (error) {
    console.log("Error get Driver: ", error);
    return error as any;
  }
};
export const updateCarrier = async (data: IAPIDriver): Promise<IListData> => {
  try {
    const response: IListData = await axios.put(`${config.API_HOST}/driver/update`, data, {
      headers: {
        Accept: "application/json, text/plain, */*"
      }
    });
    return response;
  } catch (error) {
    console.log("Error get carrier: ", error);
    return error as any;
  }
};