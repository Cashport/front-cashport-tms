import { GenericResponse } from "@/types/global/IGlobal";
import { API } from "@/utils/api/api";
import { IGeneratePaymentLinkResponse, IPaymentLinkData } from "@/types/commerce/ICommerce";

export const generatePaymentLink = async (clientId: string, modelData: IPaymentLinkData) => {
  try {
    const response: GenericResponse<IGeneratePaymentLinkResponse> = await API.post(
      `/marketplace/clients/${clientId}/payment-links`,
      modelData
    );
    return response.data;
  } catch (error) {
    console.error("Error al generar el link de pago:", error);
    throw error;
  }
};
