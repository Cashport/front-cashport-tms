import config from "@/config";
import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IChatData, ITicket } from "@/types/chat/IChat";

export const getTickets = async (): Promise<ITicket[]> => {
  try {
    const response: GenericResponse<ITicket[]> = await API.get("/whatsapp-tickets?limit=20", {
      baseURL: config.API_CHAT
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching tickets:", error);
    throw error;
  }
};

export const getOneTicket = async (ticketId: string): Promise<IChatData> => {
  try {
    const response: GenericResponse<IChatData> = await API.get(
      `/whatsapp-messages/ticket/${ticketId}`,
      {
        baseURL: config.API_CHAT
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching ticket:", error);
    throw error;
  }
};

export const sendMessage = async (customerId: string, message: string): Promise<void> => {
  try {
    const body = {
      customerId,
      message
    };
    await API.post(`/whatsapp-messages`, body, {
      baseURL: config.API_CHAT
    });
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
