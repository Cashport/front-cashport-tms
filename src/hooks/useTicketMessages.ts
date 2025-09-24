import { IChatData } from "@/types/chat/IChat";
import { getOneTicket } from "@/services/chat/chat";
import useSWR from "swr";

const useTicketMessages = (ticketId: string) => {
  const { data, isLoading, error, mutate } = useSWR<IChatData>(
    `/whatsapp-messages/ticket/${ticketId}`,
    () => getOneTicket(ticketId)
  );

  return { data, isLoading, error, mutate };
};

export default useTicketMessages;