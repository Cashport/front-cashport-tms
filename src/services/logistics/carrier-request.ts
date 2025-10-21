import { GenericResponse } from "@/types/global/IGlobal";
import {
  ICreateCarrierRequestAuctionBody,
  IGetCarrierRequestsByTransferRequestId,
  SendCarrierRequest
} from "@/types/logistics/carrier/carrier";
import { ITransferRequestJourneyReview } from "@/types/logistics/schema";
import { API } from "@/utils/api/api";

export const sendCarrierRequest = async (data: SendCarrierRequest) => {
  const response: GenericResponse<{ journey: ITransferRequestJourneyReview[] }> = await API.post(
    "/carrier/create/request",
    data
  );
  if (response.success) return response.data;
  throw new Error(response?.message || "Error al enviar solicitud");
};

export const sendTenderProposalToCarriers = async (data: ICreateCarrierRequestAuctionBody) => {
  try {
    const response: GenericResponse = await API.post("/carrier/create/request/auction", data);
    if (response.success) return response.data;
  } catch (error) {
    console.error("Error sending tender proposal:", error);
    throw error;
  }
};

export const getPricingComparisonByTransferRequestId = async (carrierRequestIds: number[]) => {
  try {
    const response: GenericResponse<IGetCarrierRequestsByTransferRequestId[]> = await API.post(
      "/carrier/request/get-pricing-comparison",
      { carrierRequestIds }
    );
    if (response.success) return response.data[0];
  } catch (error) {
    console.error("Error fetching pricing comparison:", error);
    throw error;
  }
};
