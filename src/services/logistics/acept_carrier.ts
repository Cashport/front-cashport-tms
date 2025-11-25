import { API } from "@/utils/api/api";
import { Data, ICarrierRequestDrivers, ICarrierRequestVehicles } from "@/types/logistics/schema";
import { GenericResponse } from "@/types/global/IGlobal";
import { CarrierCollapseAPI, IAceptCarrierAPI } from "@/types/logistics/carrier/carrier";

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

export const getAceptCarrierRequestById = async (id: string): Promise<IAceptCarrierAPI> => {
  const form = new FormData();
  form.append("id", id);
  const response: GenericResponse<IAceptCarrierAPI> = await API.post(`/carrier/request/id`, form);
  if (response.success) return response.data;
  throw new Error(response?.message || "Error al obtener la lista de solicitudes de carga");
};

export const getVehiclesByCarrierId = async (
  id: number,
  transferRequestId: number
): Promise<GenericResponse<ICarrierRequestVehicles[]>> => {
  try {
    const response: GenericResponse<ICarrierRequestVehicles[]> = await API.get(
      `/vehicle/provider-active/${id}/${transferRequestId}`
    );
    return response;
  } catch (error) {
    console.error("Error get all getAllTransferRequestList: ", error);
    return error as any;
  }
};

export const getDriverByCarrierId = async (
  id: number,
  transferRequestId: number
): Promise<GenericResponse<ICarrierRequestDrivers[]>> => {
  try {
    const response: GenericResponse<ICarrierRequestDrivers[]> = await API.get(
      `/driver/provider-active/${id}/${transferRequestId}`
    );
    return response;
  } catch (error) {
    console.error("Error get all getAllTransferRequestList: ", error);
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
        "Content-Type": "multipart/form-data"
      }
    });
    return response;
  } catch (error) {
    console.log("Error get getTransferRequestById: ", error);
    return error as any;
  }
};

export const postCarrierRequest = async (
  id_carrier: number,
  id_carrier_request: number,
  id_vehicle: number,
  id_drivers: number[],
  accept_conditions: string,
  observation: string,
  fare?: number,
  file?: File,
  association_cost?: number,
  association_name?: number,
  association_file?: File
): Promise<Data> => {
  try {
    const form = new FormData();
    const body = {
      id_carrier: id_carrier,
      id_carrier_request: id_carrier_request,
      id_vehicle: id_vehicle,
      id_drivers: id_drivers,
      accept_conditions: accept_conditions,
      observation: observation,
      ...(fare !== undefined && { fare }),
      ...(association_cost !== undefined && { association_cost }),
      ...(association_name && { association_name })
    };

    form.append("request", JSON.stringify(body));
    if (file) {
      form.append("file", file);
    }

    if (association_file) {
      form.append("association_file", association_file);
    }

    const response: Data = await API.post(`/carrier/request/accept`, form, {
      headers: {
        "content-type": "multipart/form-data",
        Accept: "application/json, text/plain, */*"
      }
    });
    return response;
  } catch (error) {
    console.error("Error get getTransferRequestById: ", error);
    throw error;
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
