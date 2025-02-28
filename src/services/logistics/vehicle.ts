import axios, { AxiosResponse } from "axios";
import config from "@/config";
import { IVehicle, CustomFile, VehicleType } from "@/types/logistics/schema";
import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { DocumentCompleteType } from "@/types/logistics/certificate/certificate";
import { VehicleData } from "@/components/molecules/tabs/logisticsForms/vehicleForm/vehicleFormTab.mapper";
import { IFeature } from "@/types/features/feature";

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

export const getVehicleById = async (id: string): Promise<VehicleData> => {
  const response: GenericResponse<VehicleData> = await API.get(`/vehicle/${id}`);
  if (response.success) return response.data;
  throw new Error(response?.message || "Error");
};

export const createVehicleForm = (
  data: IVehicle,
  files: DocumentCompleteType[],
  formImages: CustomFile[]
) => {
  const form = new FormData();
  const body: any = { ...data };
  const hasImage = formImages.length > 0;
  if (!hasImage) {
    throw new Error("At least one image file is required.");
  }

  body.images = formImages?.map((file: any, index) => ({
    docReference: file.docReference || `image${index + 1}`,
    uid: file?.uid,
    url_archive: file?.url_archive
  }));

  const expiration = files.find((f) => !f.expirationDate && f.expiry);
  if (expiration) {
    throw new Error(`El documento ${expiration.description} debe tener una fecha de vencimiento`);
  }

  body.files = files;

  form.append("body", JSON.stringify(body));

  formImages.forEach((file: CustomFile, index: number) => {
    if (file?.uid) {
      form.append(`image${index + 1}`, file);
    } else {
      console.warn(`Image ${index + 1} is undefined.`);
    }
  });

  files.forEach((file) => {
    if (file.file) {
      form.append(`file-for-${file.id}`, file.file);
    } else {
      console.warn(`File with id ${file.id} is undefined.`);
    }
  });

  return form;
};

export const addVehicle = async (
  data: IVehicle,
  files: DocumentCompleteType[],
  formImages: CustomFile[]
): Promise<AxiosResponse<any, any>> => {
  try {
    const form = createVehicleForm(data, files, formImages);
    const response = await API.post(`/vehicle/create`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json, text/plain, */*"
      }
    });
    return response;
  } catch (error) {
    console.log("Error creating vehicle: ", error);
    throw error as any;
  }
};
export const updateVehicle = async (
  data: IVehicle,
  files: DocumentCompleteType[],
  formImages: CustomFile[]
): Promise<AxiosResponse<any, any>> => {
  try {
    const form = createVehicleForm(data, files, formImages);
    const response = await API.put(`/vehicle/update`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json, text/plain, */*",
      }
    });
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
