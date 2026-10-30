import { GenericResponse } from "@/types/global/IGlobal";
import { IControlTowerApi } from "@/types/logistics/controlTower/controlTower";
import { API } from "@/utils/api/api";

/** Datos de la Torre de control TMS del proyecto activo. */
export const getControlTowerData = async (): Promise<IControlTowerApi> => {
  const response: GenericResponse<IControlTowerApi> = await API.get(`/control-tower`);
  return response.data;
};
