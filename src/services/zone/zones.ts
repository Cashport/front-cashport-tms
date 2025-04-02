import { GenericResponse } from "@/types/global/IGlobal";
import { IZones } from "@/types/zones/IZones";
import { API } from "@/utils/api/api";
import { SUCCESS } from "@/utils/constants/globalConstants";
import { MessageInstance } from "antd/es/message/interface";

export const getAllZones = async ({ idProject }: { idProject: string }): Promise<IZones> => {
  try {
    const response: IZones = await API.get(`/zone/project/${idProject}`);

    return response;
  } catch (error) {
    return error as any;
  }
};

export const addZone = async ({
  name,
  project_id,
  messageApi
}: {
  name: string;
  project_id: string;
  messageApi: MessageInstance;
}): Promise<GenericResponse> => {
  try {
    const response: GenericResponse = await API.post(`/zone/`, {
      zone_description: name,
      project_id
    });
    if (response.status === SUCCESS) {
      messageApi.open({
        type: "success",
        content: `La zona fue creada exitosamente.`
      });
    } else {
      messageApi.open({
        type: "error",
        content: "Oops ocurrio un error."
      });
    }

    return response;
  } catch (error) {
    return error as any;
  }
};

export const removeZoneById = async ({
  idZone,
  messageApi
}: {
  idZone: string;
  messageApi: MessageInstance;
}): Promise<GenericResponse> => {
  try {
    const response: GenericResponse = await API.delete(`/zone/${idZone}`);
    if (response.status === SUCCESS) {
      messageApi.open({
        type: "success",
        content: `La zona fue eliminada exitosamente.`
      });
    } else {
      messageApi.open({
        type: "error",
        content: "Oops ocurrio un error."
      });
    }

    return response;
  } catch (error) {
    return error as any;
  }
};
