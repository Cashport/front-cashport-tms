import { AxiosResponse } from "axios";
import { MessageInstance } from "antd/es/message/interface";
import { API } from "@/utils/api/api";
import { SUCCESS } from "@/utils/constants/globalConstants";

import { IBRE } from "@/types/bre/IBRE";

export const getBusinessRulesByProjectId = async (
  idProject: number
): Promise<IBRE> => {
  try {
    const response: IBRE = await API.get(
      `/bussines-rule/project/${idProject}`
    );
    return response;
  } catch (error) {
    return error as any;
  }
};
export const addChannelBR = async (
  project_id: number,
  channelDescription: string,
  messageApi: MessageInstance
) => {
  const sendData = {
    project_id,
    channel_description: channelDescription
  };
  try {
    const response: AxiosResponse = await API.post(
      `/bussines-rule/project/channel`,
      sendData,
    );
    if (response.status === SUCCESS) {
      messageApi.open({
        type: "success",
        content: `El canal fue creado exitosamente.`
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
export const addLineBR = async (
  channelId: string,
  lineDescription: string,
  messageApi: MessageInstance
) => {
  const sendData = {
    channel_id: channelId,
    line_description: lineDescription
  };
  try {
    const response: AxiosResponse = await API.post(
      `/bussines-rule/project/channel/line`,
      sendData
    );
    if (response.status === SUCCESS) {
      messageApi.open({
        type: "success",
        content: `La Linea fue creada exitosamente.`
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
export const addSublineBR = async (
  lineId: string,
  sublineDescription: string,
  messageApi: MessageInstance
) => {
  const sendData = {
    line_id: lineId,
    subline_description: sublineDescription
  };
  try {
    const response: AxiosResponse = await API.post(
      `/bussines-rule/project/channel/line/subline`,
      sendData
    );
    if (response.status === SUCCESS) {
      messageApi.open({
        type: "success",
        content: `La Sublinea fue creada exitosamente.`
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

export const removeChannelBR = async (
  project_id: number,
  channel_id: string,
  messageApi: MessageInstance
) => {

  try {
    const response: AxiosResponse = await API.delete(
      `/bussines-rule/project/${project_id}/channel/${channel_id}`
    );
    if (response.status === SUCCESS) {
      messageApi.open({
        type: "success",
        content: `El canal fue eliminado exitosamente.`
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

export const removeLineBR = async (
  channel_id: number,
  line_id: number,
  messageApi: MessageInstance
) => {

  try {
    const response: AxiosResponse = await API.delete(
      `/bussines-rule/channel/${channel_id}/line/${line_id}`,
    );
    if (response.status === SUCCESS) {
      messageApi.open({
        type: "success",
        content: `La linea fue eliminada exitosamente.`
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

export const removeSublineBR = async (
  line_id: number,
  subline_id: number,
  messageApi: MessageInstance
) => {

  try {
    const response: AxiosResponse = await API.delete(
      `/bussines-rule/line/${line_id}/subline/${subline_id}`
    );
    if (response.status === SUCCESS) {
      messageApi.open({
        type: "success",
        content: `La sublinea fue eliminada exitosamente.`
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
