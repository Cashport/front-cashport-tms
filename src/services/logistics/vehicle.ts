import { AxiosResponse } from "axios";
import { IVehicle, CustomFile, VehicleType, IFormGeneralVehicle } from "@/types/logistics/schema";
import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { ICertificateAndDocuments } from "@/types/logistics/certificate/certificate";

import { IFeature } from "@/types/features/feature";
import { ICreateVehicleForm } from "@/components/organisms/logistics/vehicles/createVehicle/createVehicle";
import { IUploadRequirementstTableRow } from "@/components/organisms/logistics/proveedores/ModalUploadRequirements/ModalUploadRequirements";

export const getAllVehicles = async ({ id }: { id: string }): Promise<any[]> => {
  const response: GenericResponse<any[]> = await API.get(`/vehicle/provider/${id}`);
  if (response.success) return response.data;
  throw new Error(response?.message || "Error");
};

export const getVehicleType = async (): Promise<VehicleType[]> => {
  const response: GenericResponse<VehicleType[]> = await API.get(`/vehicle/type`);
  if (response.success) return response.data;
  throw new Error(response?.message || "Error");
};

export const getFeaturesVehicle = async (): Promise<IFeature[]> => {
  const response: GenericResponse<IFeature[]> = await API.get(`/vehicle/features`);
  if (response.success) return response.data;
  throw new Error(response?.message || "Error");
};

export const getVehicleById = async (id: string): Promise<IVehicle> => {
  console.log("id", id);
  const response: GenericResponse<IVehicle> = await API.get(`/vehicle/${id}`);
  if (response.success) return response.data;
  throw new Error(response?.message || "Error");
};

export const createVehicleForm = (data: ICreateVehicleForm, formImages?: any[]) => {
  const form = new FormData();
  const body: IFormGeneralVehicle = { ...data };
  const files: IUploadRequirementstTableRow[] = data.uploadedFiles || [];

  formImages?.forEach((file: any, index: number) => {
    if (file && file.file) {
      form.append(`image${index + 1}`, file.file);
    } else {
      console.warn(`Image ${index + 1} is undefined.`);
    }
  });

  // for each file add it to the formData
  files.forEach((file) => {
    if (file && file.file) {
      form.append(file.fileName, file.file);
    }
  });

  form.append("body", JSON.stringify(body));

  return form;
};

export const addVehicle = async (data: ICreateVehicleForm, imageFiles: CustomFile[]) => {
  try {
    const form = createVehicleForm(data, imageFiles);
    Array.from(form.entries()).forEach((pair) => {
      console.log(pair[0], pair[1]);
    });
    const response = await API.post(`/vehicle/create`, form);
    return response;
  } catch (error) {
    console.log("Error creating vehicle: ", error);
    throw error as any;
  }
};
export const updateVehicle = async (
  data: IVehicle,
  files: ICertificateAndDocuments[],
  formImages: CustomFile[]
): Promise<AxiosResponse<any, any>> => {
  try {
    const form = createVehicleForm(data, formImages);
    const response = await API.put(`/vehicle/update`, form);
    return response;
  } catch (error) {
    console.log("Error updating vehicle: ", error);
    throw error as any;
  }
};

export const updateVehicleStatus = async (
  id: string,
  status: number
): Promise<AxiosResponse<any, any>> => {
  const response: GenericResponse = await API.put(`/vehicle/update-status/${id}`, {
    status
  });
  if (response.success) return response.data;
  throw new Error(response.message || "Error al actualizar el estado del vehiculo");
};
