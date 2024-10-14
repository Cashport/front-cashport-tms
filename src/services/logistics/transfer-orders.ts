import axios, { AxiosResponse } from "axios";
import { API, getIdToken } from "@/utils/api/api";
import config from "@/config";
import { IDocumentCompleted, IListData, ITransferOrder } from "@/types/logistics/schema";
import { GenericResponse } from "@/types/global/IGlobal";

export const addTransferOrder = async (
  data: ITransferOrder,
  files: IDocumentCompleted[]
): Promise<any> => {
  try {
    //const token = await getIdToken();
    const form = new FormData();
    const body: any = data;
    body.files = files;
    files.forEach((file) => {
      if (file.file) form.append(`file-for-${file.id_document_type}`, file.file);
    });
    form.append("body", JSON.stringify({ ...body }));
    const response: GenericResponse = await API.sendFormData(`/transfer-order/create`, form);
    console.log("RESPONSE addTransferOrder", response);
    if (response.success) return response.data;
    throw new Error(response?.message || "Error /transfer-order/create`");
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error?.message || "Error /transfer-order/create");
    }
  }
};

export const getAllTransferOrderList = async (): Promise<IListData> => {
  const token = await getIdToken();
  try {
    const response: IListData = await axios.get(`${config.API_HOST}/transfer-order/list`, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`
      }
    });
    return response;
  } catch (error) {
    console.log("Error get all getAllTransferOrderList: ", error);
    return error as any;
  }
};

export const getTransferOrderById = async (id: string): Promise<IListData> => {
  const token = await getIdToken();
  try {
    const form = new FormData();
    form.append("id", id);

    const response: IListData = await axios.post(`${config.API_HOST}/transfer-order/id`, form, {
      headers: {
        Accept: "application/json, text/plain, */*",
        Authorization: `Bearer ${token}`
      }
    });

    return response;
  } catch (error) {
    console.log("Error getTransferOrderById: ", error);
    return error as any;
  }
};

export const getAllUserSearch = async (term: string): Promise<IListData> => {
  const token = await getIdToken();
  try {
    const form = new FormData();
    form.append("term", term);
    const response: IListData = await axios.post(
      `${config.API_HOST}/transfer-order/all/users/search`,
      form,
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response;
  } catch (error) {
    console.log("Error get all getAllUserSearch: ", error);
    return error as any;
  }
};

export const getAllUsers = async (): Promise<IListData> => {
  const token = await getIdToken();
  try {
    const response: IListData = await axios.get(`${config.API_HOST}/transfer-order/all/users`, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`
      }
    });
    return response;
  } catch (error) {
    console.log("Error get all getAllUsers: ", error);
    return error as any;
  }
};
