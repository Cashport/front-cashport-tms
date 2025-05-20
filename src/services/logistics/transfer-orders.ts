import { API, getIdToken } from "@/utils/api/api";
import config from "@/config";
import { IDocumentCompleted, ITransferOrder } from "@/types/logistics/schema";
import { GenericResponse } from "@/types/global/IGlobal";

export const addTransferOrder = async (
  data: ITransferOrder,
  files: IDocumentCompleted[]
): Promise<any> => {
  try {
    const form = new FormData();
    const body: any = data;
    body.files = files;
    files.forEach((file) => {
      if (file.file) form.append(`file-for-${file.id_document_type}`, file.file);
    });
    form.append("body", JSON.stringify({ ...body }));
    const response = await API.post(`/transfer-order/create`, form, {
      headers: {
        "content-type": "multipart/form-data",
        Accept: "application/json, text/plain, */*"
      }
    });
    if (response?.data) return response.data;
  } catch (error: any) {
    console.log("Error post transfer-order/: ", error);
    let msg = "";
    if (Array.isArray(error?.response?.data?.data))
      msg = error?.response?.data?.data.map((item: any) => item?.msg || "").join(" - ");
    throw new Error(
      msg || error?.response?.data?.message || "Ocurrio un error al crear la operacion"
    ) as any;
  }
};

export const getAllTransferOrderList = async (): Promise<GenericResponse> => {
  try {
    const response: GenericResponse = await API.get(`/transfer-order/list`);
    return response;
  } catch (error) {
    console.log("Error get all getAllTransferOrderList: ", error);
    return error as any;
  }
};

export const getTransferOrderById = async (id: string): Promise<GenericResponse> => {
  try {
    const form = new FormData();
    form.append("id", id);

    const response: GenericResponse = await API.post(`/transfer-order/id`, form);

    return response;
  } catch (error) {
    console.log("Error getTransferOrderById: ", error);
    return error as any;
  }
};

export const getAllUserSearch = async (term: string): Promise<GenericResponse> => {
  try {
    const form = new FormData();
    form.append("term", term);
    const response: GenericResponse = await API.post(`/transfer-order/all/users/search`, form, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data"
      }
    });
    return response;
  } catch (error) {
    console.log("Error get all getAllUserSearch: ", error);
    return error as any;
  }
};

export const getAllUsers = async (): Promise<GenericResponse> => {
  try {
    const response: GenericResponse = await API.get(`/transfer-order/all/users`);
    return response;
  } catch (error) {
    console.log("Error get all getAllUsers: ", error);
    return error as any;
  }
};
