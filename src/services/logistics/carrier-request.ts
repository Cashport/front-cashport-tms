import { GenericResponse } from "@/types/global/IGlobal";
import { SendCarrierRequest } from "@/types/logistics/carrier/carrier";
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
