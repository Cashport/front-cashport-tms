import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";

export const getAllCarriers = async (): Promise<any> => {
  const response: GenericResponse = await API.get(`/carrier/all`);
  if (response.success) return response.data;
  else throw response;
};

export interface ICarrierById {
  id: number;
  business_name: string;
  description: string;
  billing_email: string;
  communication_email: string;
  contact_name: string;
  created_at: string;
  created_by: string;
  modified_at: string;
  modified_by: string;
  nit: string;
  phone_number: number;
  id_vendor: number;
  id_carrier_type: number | null;
  subject_id: number | null;
  active: boolean; // 1 o 0
  icon: string;
  documents: any[];
  features: {
    id: number;
    description: string;
    idEntityType: number;
    idFeatureEntity: number;
  }[];
  status: {
    id: number;
    name: string;
    color: string;
    backgroundColor: string;
  };
}

export const getCarrierById = async (id: string): Promise<ICarrierById> => {
  const response: GenericResponse<ICarrierById> = await API.get(`/carrier/${id}`);
  console.log("response getCarrierById", response);
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
