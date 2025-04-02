import config from "@/config";
import { IRoles } from "@/types/roles/IRoles";
import { API } from "@/utils/api/api";

export const getAllRoles = async (): Promise<IRoles> => {
  try {
    const response: IRoles = await API.get(`${config.API_HOST}/role`);
    return response;
  } catch (error) {
    return error as any;
  }
};
