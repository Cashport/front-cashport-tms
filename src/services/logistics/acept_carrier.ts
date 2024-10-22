import axios from "axios";

import { API, getIdToken } from "@/utils/api/api";
import config from "@/config";
import { IListData } from "@/types/logistics/schema";
import { GenericResponse } from "@/types/global/IGlobal";
import { IAPIResponse } from "@/types/logistics/carrier/carrier";

export const getAllTransferRequestList = async (): Promise<IListData> => {
  const token = await getIdToken();
  try {
    const response: IListData = await axios.get(`${config.API_HOST}/transfer-request/list`, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`
      }
    });
    return response;
  } catch (error) {
    console.log("Error get all getAllTransferRequestList: ", error);
    return error as any;
  }
};

export const getAceptCarrierRequestList = async (): Promise<any> => {
  const response: GenericResponse = await API.post(`/carrier/all/request/list`);
  if (response.success) return response.data;
  throw new Error(response?.message || "Error al obtener la lista de solicitudes de carga");
};

export const getAceptCarrierRequestById = async (id: string): Promise<any> => {
  const form = new FormData();
  form.append("id", id);
  const response: GenericResponse = await API.post(`/carrier/request/id`, form);
  if (response.success) return response.data;
  throw new Error(response?.message || "Error al obtener la lista de solicitudes de carga");
};

export const getVehiclesByCarrierId = async (id: number): Promise<IListData> => {
  const token = await getIdToken();
  try {
    const response: IListData = await axios.get(
      `${config.API_HOST}/vehicle/provider-active/${id}`,
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
    console.log("Error get all getAllTransferRequestList: ", error);
    return error as any;
  }
};

export const getDriverByCarrierId = async (id: number): Promise<IListData> => {
  const token = await getIdToken();
  try {
    const response: IListData = await axios.get(`${config.API_HOST}/driver/provider-active/${id}`, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`
      }
    });
    return response;
  } catch (error) {
    console.log("Error get all getAllTransferRequestList: ", error);
    return error as any;
  }
};

export const getAllTransferRequest = async (): Promise<IListData> => {
  const token = await getIdToken();
  try {
    const response: IListData = await axios.get(`${config.API_HOST}/transfer-request/all`, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`
      }
    });
    return response;
  } catch (error) {
    console.log("Error get all getAllTransferRequestList: ", error);
    return error as any;
  }
};

export const getAllTransferRequestCostCenter = async (): Promise<IListData> => {
  const token = await getIdToken();
  try {
    const response: IListData = await axios.get(
      `${config.API_HOST}/transfer-request/all/cost-center`,
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
    console.log("Error get all getAllTransferRequest: ", error);
    return error as any;
  }
};

export const getAllTransferRequestProduct = async (): Promise<IListData> => {
  const token = await getIdToken();
  try {
    const response: IListData = await axios.get(`${config.API_HOST}/transfer-request/all/product`, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`
      }
    });
    return response;
  } catch (error) {
    console.log("Error get all getAllTransferRequest: ", error);
    return error as any;
  }
};

export const getTransferRequestById = async (id: string): Promise<IListData> => {
  const token = await getIdToken();
  try {
    const form = new FormData();
    form.append("id", id);

    const response: IListData = await axios.post(`${config.API_HOST}/transfer-request/id`, form, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`
      }
    });
    return response;
  } catch (error) {
    console.log("Error get getTransferRequestById: ", error);
    return error as any;
  }
};

export const postCarrierRequest = async (
  id_carrier: string,
  id_carrier_request: string,
  id_vehicle: string,
  id_drivers: string[],
  accept_conditions: string,
  observation: string
): Promise<IListData> => {
  try {
    const body = {
      id_carrier: id_carrier,
      id_carrier_request: id_carrier_request,
      id_vehicle: id_vehicle,
      id_drivers: id_drivers,
      accept_conditions: accept_conditions,
      observation: observation
    };

    const response: IListData = await API.post(`/carrier/request/accept`, body);
    return response;
  } catch (error) {
    console.log("Error get getTransferRequestById: ", error);
    return error as any;
  }
};

export const postCarrierReject = async (
  id_carrier: string,
  id_carrier_request: string
): Promise<IListData> => {
  try {
    const body = {
      id_carrier: id_carrier,
      id_carrier_request: id_carrier_request
    };

    const response: IListData = await API.post(`/carrier/request/reject`, body);
    return response;
  } catch (error) {
    console.log("Error get getTransferRequestById: ", error);
    return error as any;
  }
};
export const putEditCarrierRequest = async (
  id_carrier: string,
  id_carrier_request: string,
  id_vehicle: string,
  id_drivers: string[]
) => {
  const body = {
    id_carrier: id_carrier,
    id_carrier_request: id_carrier_request,
    id_vehicle: id_vehicle,
    id_drivers: id_drivers
  };
  const response: GenericResponse = await API.put(`/carrier/request/edit`, body);
  if (response.success) return response;
  throw new Error(response?.message || "Error al editar la solicitud de carga");
};
