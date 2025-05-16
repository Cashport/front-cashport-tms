import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";

export const getAllCarriers = async (): Promise<any> => {
  const response: GenericResponse = await API.get(`/carrier/all`);
  if (response.success) return response.data;
  else throw response;
};

export const getCarrierById = async (id: string): Promise<any> => {
  const response: GenericResponse = await API.get(`/carrier/${id}`);
  if (response.success) return response.data;
  throw new Error(response?.message || "Error");
};

export const updateCarrier = async (form: any): Promise<any> => {
  const data = {
    features: form.trip_type.map((tripType: any) => ({
      id: tripType.value
    }))
  };
  try {
    const response: GenericResponse = await API.put(`/carrier/update/${form.id}`, data);
    return response;
  } catch (error) {
    console.log("Error get carrier: ", error);
    return error as any;
  }
};
export const getTripTypes = async (): Promise<any[]> => {
  const response: GenericResponse<any[]> = await API.get(`/carrier/features`);
  if (response.success) return response.data;
  throw new Error(response?.message || "Error");
};

export const updateProviderStatus = async (id: string, status: number): Promise<any> => {
  const response: GenericResponse = await API.put(`/carrier/update-status/${id}`, {
    status
  });
  if (response.success) return response.data;
  throw new Error(response.message || "Error al actualizar el estado del proveedor");
};
