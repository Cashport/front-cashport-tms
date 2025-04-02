import { API } from "@/utils/api/api";
import { CREATED, SUCCESS } from "@/utils/constants/globalConstants";
import { MessageInstance } from "antd/es/message/interface";
import { AxiosResponse } from "axios";

export const addHolding = async ({
  name,
  projectId,
  messageApi
}: {
  name: string;
  projectId: number;
  messageApi: MessageInstance;
}): Promise<AxiosResponse<any>> => {
  try {
    const response: AxiosResponse<any> = await API.post(`/holding`, {
      name,
      project_id: projectId
    });
    if (response.status === CREATED) {
      messageApi.open({
        type: "success",
        content: `El holding fue creado exitosamente.`
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

export const removeHoldingById = async ({
  idHolding,
  messageApi
}: {
  idHolding: string;
  messageApi: MessageInstance;
}): Promise<AxiosResponse<any>> => {
  try {
    const response: AxiosResponse<any> = await API.delete(
      `/holding/${idHolding}`,
    );
    if (response.status === SUCCESS) {
      messageApi.open({
        type: "success",
        content: `El holding fue eliminado exitosamente.`
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
