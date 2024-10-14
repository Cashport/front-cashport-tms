import { GenericResponse, GenericResponsePage } from "@/types/global/IGlobal";
import {
  ITrackingPartial,
  ITransferOrdersRequest,
  ITransferRequestCreation,
  ITransferRequestJourneyInfo,
  IVehiclesPricing,
  IVehiclesPricingList,
  IVehiclesPricingTrips
} from "@/types/logistics/schema";
import { TransferRequestFinish } from "@/types/logistics/transferRequest/transferRequest";
import {
  JourneyTripPricing,
  TripCreation,
  TripsCreation
} from "@/types/logistics/trips/TripsSchema";
import { API } from "@/utils/api/api";
import {
  ITransferRequestDetail,
  ITransferRequestResponse
} from "@/types/transferRequest/ITransferRequest";
import { downloadCSVFromEndpoint } from "./download_csv";

{
  /*export const transferOrderMerge = async (orders: number[]) => {
  try {
    const response: AxiosResponse = await API.post(`/transfer-order/merge`, orders);
    return response;
  } catch (error) {
    return error as any;
  }
};*/
}

export const transferOrderMerge = async (ordersId: number[]): Promise<ITransferOrdersRequest> => {
  const response: GenericResponse<ITransferOrdersRequest> = await API.post(
    `/transfer-order/merge`,
    { orders: ordersId }
  );
  if (response.success) return response.data;
  throw new Error(
    response?.message || "Error obteniendo los pasos de la solicitud de transferencia"
  );
};

export const createTransferRequest = async (
  transferOrderIds: number[],
  trackingPartial: ITrackingPartial[]
): Promise<ITransferRequestCreation> => {
  const response: GenericResponse<ITransferRequestCreation> = await API.post(
    `/transfer-request/create`,
    { transferOrderIds, trackingPartial }
  );
  if (response.success) return response.data;
  else
    throw new Error(
      response?.message || "Error obteniendo los pasos de la solicitud de transferencia"
    );
};

export const getTransferRequestVehicles = async (id_journey: number) => {
  const response: GenericResponse<{
    vehiclesPricing: IVehiclesPricing[];
    trips: IVehiclesPricingTrips[];
  }> = await API.get(`/transfer-request/vehicles/${id_journey}`);
  if (response.success) return response.data;
  throw new Error(
    response?.message || "Error obteniendo los vehículos de la solicitud de transferencia"
  );
};

export const getTransferRequestSteps = async (
  transfer_request: number
): Promise<ITransferRequestCreation> => {
  const response: GenericResponse<ITransferRequestCreation> = await API.get(
    `/transfer-request/steps/${transfer_request}`
  );
  if (response.success) return response.data;
  throw new Error(
    response?.message || "Error obteniendo los pasos de la solicitud de transferencia"
  );
};

export const submitTrips = async (
  id_transfer_request: number,
  id_journey: number,
  trips: TripCreation[]
) => {
  const body: TripsCreation = {
    id_transfer_request,
    id_journey,
    trips
  };
  const response: GenericResponse<IVehiclesPricingTrips[]> = await API.post(
    `/trip/trips-material`,
    body
  );
  if (response.success) return response.data;
  throw new Error(
    response?.message || "Error obteniendo los pasos de la solicitud de transferencia"
  );
};

export const getTransferRequestPricing = async ({
  idTransferRequest
}: {
  idTransferRequest: number;
}) => {
  const response: GenericResponse<JourneyTripPricing[]> = await API.get(
    `/transfer-request/pricing/${idTransferRequest}`
  );
  if (response.success) return response.data;
  throw new Error(
    response?.message || "Error obteniendo los pasos de la solicitud de transferencia"
  );
};

export const finishTransferRequest = async (data: TransferRequestFinish) => {
  const response: GenericResponse<boolean> = await API.post(`/transfer-request/finish`, data);
  if (response.success) return response.data;
  throw new Error(
    response?.message || "Error obteniendo los pasos de la solicitud de transferencia"
  );
};

export const getAcceptedTransferRequest = async (): Promise<ITransferRequestResponse[]> => {
  const response: GenericResponse<ITransferRequestResponse[]> = await API.get(
    `/transfer-request/transfer-request-order`
  );
  if (response.success) return response.data;
  console.log("getAcceptedTransferRequest", response);
  throw new Error(response?.message || "Error");
};

export const getOnRouteTransferRequest = async (): Promise<ITransferRequestResponse[]> => {
  const response: GenericResponse<ITransferRequestResponse[]> = await API.get(
    `/transfer-request/transfer-request-on-route`
  );
  if (response.success) return response.data;
  console.log("getOnRouteTransferRequest", response);
  throw new Error(response?.message || "Error");
};

export const getFinishedTransferRequest = async (): Promise<ITransferRequestResponse[]> => {
  const response: GenericResponse<ITransferRequestResponse[]> = await API.get(
    `/transfer-request/transfer-request-finished`
  );
  if (response.success) return response.data;
  console.log("getFinishedTransferRequest", response);
  throw new Error(response?.message || "Error");
};

export const getTransferRequestDetail = async (
  id: number
): Promise<ITransferRequestDetail | {}> => {
  const response: GenericResponse<ITransferRequestResponse> = await API.get(
    `/transfer-request/details/${id}`
  );
  if (response.success) return response.data;
  throw new Error(response?.message || "Error");
};

export const updateTransferRequestStatus = async (
  id: number,
  statusId: string
): Promise<boolean> => {
  try {
    const { success }: GenericResponse<ITransferRequestResponse> = await API.post(
      `/transfer-request/update-status`,
      {
        transferRequestId: id,
        statusId
      }
    );
    if (success) return true;
    return false;
  } catch (error) {
    console.error("Error update request/update-status/: ", error);
    throw error as any;
  }
};

export const downloadCsvTransferOrders = async () => {
  await downloadCSVFromEndpoint(`transfer-order/download-orders`, "transfer orders.csv");
};

export const deleteOrders = async (trIds: number[], toIds: number[]): Promise<any> => {
  const customConfig = {
    data: {
      transferRequestIds: trIds,
      transferOrderIds: toIds
    }
  };
  const response: GenericResponse<any> = await API.delete(
    `/transfer-request/delete-to-tr`,
    customConfig
  );
  if (response.success) return response.success;
  throw new Error(response?.message || "Error");
};
