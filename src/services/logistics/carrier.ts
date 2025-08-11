import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";

export interface IProvider {
  id: number;
  id_vendor: number;
  business_name: string;
  description: string;
  nit: string;
  phone_number: number;
  billing_email: string;
  communication_email: string;
  contact_name: string;
  active: number | boolean;
  icon: string;
  drivers: number;
  vehicles: number;
  carrier_type: string | null;
  id_carrier_type: number | null;
  subject_id: number | null;
  created_at: string;
  modified_at: string;
  created_by: string;
  modified_by: string;
  status: {
    id: number;
    name: string;
    color: string;
    backgroundColor: string;
  };
  group_location_ids: number[];
}

export const getAllCarriers = async (): Promise<IProvider[]> => {
  const response: GenericResponse<IProvider[]> = await API.get(`/carrier/all`);
  if (response.success) return response.data;
  else throw response;
};

export interface ICarrierById extends Omit<IProvider, "drivers" | "vehicles" | "carrier_type"> {
  documents: any[];
  features: {
    id: number;
    description: string;
    idEntityType: number;
    idFeatureEntity: number;
  }[];
}
export const getCarrierById = async (id: string): Promise<ICarrierById> => {
  const response: GenericResponse<ICarrierById> = await API.get(`/carrier/${id}`);
  if (response.success) return response.data;
  throw new Error(response?.message || "Error");
};

export const updateCarrier = async (form: any): Promise<any> => {
  const data = {
    features: form.trip_type.map((tripType: any) => ({
      id: tripType.value
    })),
    carrier_type: form.carrier_type,
    id: form.id,
    group_location_ids: form.group_location_select?.map(({ value }: { value: number }) => value)
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
