import useSWR from "swr";
import { getTransferRequestDetail } from "@/services/logistics/transfer-request";

// Hook personalizado
export const useTransferRequestDetail = (id: number) => {
  // Convertir id a number y crear key única para SWR
  const transferId = id ? Number(id) : null;
  const swrKey = transferId ? ["transfer-request-detail", transferId] : null;

  const { data, isLoading, mutate } = useSWR(
    swrKey,
    ([, id]) => getTransferRequestDetail(Number(id)),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  );

  return {
    data: data ? data : null,
    isLoading,
    mutate
  };
};
