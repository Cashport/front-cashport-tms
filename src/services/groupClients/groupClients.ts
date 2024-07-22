import axios, { AxiosResponse } from "axios";
import config from "@/config";
import { API, getIdToken } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IClientsGroup } from "@/types/clientsGroups/IClientsGroups";

export const getOneGroup = async (groupId: number, projectId: number) => {
  try {
    const response: GenericResponse<IClientsGroup> = await API.get(
      `${config.API_HOST}/group-client/${groupId}/project/${projectId}`
    );
    return response;
  } catch (error) {
    return error as any;
  }
};

export const createGroup = async (data: any, id: number): Promise<any> => {
  const modelData = {
    name: data.name,
    clients: data.clients,
    project_id: id
  };

  const token = await getIdToken();

  try {
    const response: AxiosResponse = await axios.post(`${config.API_HOST}/group-client`, modelData, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token}`
      }
    });
    return response;
  } catch (error) {
    return error as any;
  }
};

export const updateGroup = async (
  group_id: number,
  clients: string[],
  project_id: number
): Promise<any> => {
  const modelData = {
    group_id,
    clients,
    project_id
  };

  const token = await getIdToken();

  try {
    const response: AxiosResponse = await axios.put(`${config.API_HOST}/group-client`, modelData, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token}`
      }
    });

    return response;
  } catch (error) {
    console.warn("error updating group: ", error);
    return error as any;
  }
};

export const deleteGroups = async (groupsId: number[], project_id: number): Promise<any> => {
  const modelData = {
    ids: groupsId,
    project_id
  };

  try {
    const response: AxiosResponse = await API.put(
      `${config.API_HOST}/group-client/delete`,
      modelData
    );

    return response;
  } catch (error) {
    return error as any;
  }
};

export const changeGroupState = async (
  groupsId: number[],
  status: 0 | 1,
  project_id: number
): Promise<any> => {
  const modelData = {
    groups_id: groupsId,
    project_id,
    status
  };

  const token = await getIdToken();

  try {
    const response: AxiosResponse = await axios.put(
      `${config.API_HOST}/group-client/change-status`,
      modelData,
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response;
  } catch (error) {
    return error as any;
  }
};
