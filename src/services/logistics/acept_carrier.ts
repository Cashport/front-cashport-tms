import { API } from "@/utils/api/api";
import { Data } from "@/types/logistics/schema";
import { GenericResponse } from "@/types/global/IGlobal";
import { CarrierCollapseAPI } from "@/types/logistics/carrier/carrier";

export const getAllTransferRequestList = async (): Promise<Data> => {
  try {
    const response: Data = await API.get(`/transfer-request/list`);
    return response;
  } catch (error) {
    console.log("Error get all getAllTransferRequestList: ", error);
    return error as any;
  }
};

interface IGetAceptCarrierRequestList {
  statusId?: string;
  page?: number;
  searchQuery?: string;
}

export const getAceptCarrierRequestList = async ({
  statusId,
  page,
  searchQuery
}: IGetAceptCarrierRequestList = {}): Promise<CarrierCollapseAPI[]> => {
  const body = {
    statusId,
    page,
    searchParam: searchQuery
  };

  const response: GenericResponse<CarrierCollapseAPI[]> = await API.post(
    `/carrier/all/request/list`,
    body
  );
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

export const getVehiclesByCarrierId = async (id: number): Promise<Data> => {
  try {
    const response: Data = await API.get(`/vehicle/provider-active/${id}`);
    return response;
  } catch (error) {
    console.log("Error get all getAllTransferRequestList: ", error);
    return error as any;
  }
};

export const getDriverByCarrierId = async (id: number): Promise<Data> => {
  try {
    const response: Data = await API.get(`/driver/provider-active/${id}`);
    return response;
  } catch (error) {
    console.log("Error get all getAllTransferRequestList: ", error);
    return error as any;
  }
};

export const getAllTransferRequest = async (): Promise<Data> => {
  try {
    const response: Data = await API.get(`/transfer-request/all`);
    return response;
  } catch (error) {
    console.log("Error get all getAllTransferRequestList: ", error);
    return error as any;
  }
};

export const getAllTransferRequestCostCenter = async (): Promise<Data> => {
  try {
    const response: Data = await API.get(`/transfer-request/all/cost-center`);
    return response;
  } catch (error) {
    console.log("Error get all getAllTransferRequest: ", error);
    return error as any;
  }
};

export const getAllTransferRequestProduct = async (): Promise<Data> => {
  try {
    const response: Data = await API.get(`/transfer-request/all/product`);
    return response;
  } catch (error) {
    console.log("Error get all getAllTransferRequest: ", error);
    return error as any;
  }
};

export const getTransferRequestById = async (id: string): Promise<Data> => {
  try {
    const form = new FormData();
    form.append("id", id);

    const response: Data = await API.post(`/transfer-request/id`, form, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data",
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
): Promise<Data> => {
  try {
    const body = {
      id_carrier: id_carrier,
      id_carrier_request: id_carrier_request,
      id_vehicle: id_vehicle,
      id_drivers: id_drivers,
      accept_conditions: accept_conditions,
      observation: observation
    };

    const response: Data = await API.post(`/carrier/request/accept`, body);
    return response;
  } catch (error) {
    console.log("Error get getTransferRequestById: ", error);
    return error as any;
  }
};

interface IPostCarrierRejectParams {
  id_carrier: string;
  id_carrier_request: string;
  rejection_causes: string;
  commentary?: string;
}

export const postCarrierReject = async ({
  id_carrier,
  id_carrier_request,
  rejection_causes,
  commentary
}: IPostCarrierRejectParams): Promise<Data> => {
  try {
    const body = {
      id_carrier,
      id_carrier_request,
      rejection_causes,
      commentary
    };

    const response: Data = await API.post(`/carrier/request/reject`, body);
    return response;
  } catch (error) {
    console.log("Error get getTransferRequestById: ", error);
    throw error;
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

interface IGetRejectionCauses {
  id: number;
  description: string;
}
export const getRejectionCauses = async (): Promise<IGetRejectionCauses[]> => {
  try {
    const response: GenericResponse<IGetRejectionCauses[]> = await API.get(
      `/carrier/all-rejection-causes`
    );
    if (response.status === 200) return response.data;
    else {
      throw new Error(response?.message || "Error al obtener las causas de rechazo");
    }
  } catch (error) {
    console.log("Error get getRejectionCauses: ", error);
    throw error;
  }
};
