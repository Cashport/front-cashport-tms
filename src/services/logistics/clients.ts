import { GenericResponse } from "@/types/global/IGlobal";
import { IClient } from "@/types/logistics/schema";
import { API } from "@/utils/api/api";

export const getClients = async (): Promise<GenericResponse<IClient[]>> => {
  try {
    const response: GenericResponse<IClient[]> = await API.get(`/transfer-order/all/clients`);
    return response;
  } catch (error) {
    console.error("Error get all clients: ", error);
    throw error as any;
  }
};
