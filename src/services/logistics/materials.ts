import axios, { AxiosResponse } from "axios";
import config from "@/config";
import { API, getIdToken } from "@/utils/api/api";
import {
  CustomFile,
  IListData,
  IMaterial,
  IMaterialTransportType,
  IMaterialType
} from "@/types/logistics/schema";
import { DocumentCompleteType } from "@/types/logistics/certificate/certificate";
import { GenericResponse } from "@/types/global/IGlobal";

export const getSearchMaterials = async (term: string): Promise<IListData> => {
  const token = await getIdToken();
  try {
    const formData = new FormData();
    formData.append("term", term);
    const response: IListData = await axios.post(`${config.API_HOST}/material/search`, formData, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`
      }
    });
    return response;
  } catch (error) {
    console.log("Error creating new location: ", error);
    return error as any;
  }
};

export const getAllMaterials = async (): Promise<IListData> => {
  const token = await getIdToken();
  try {
    const response: IListData = await axios.get(`${config.API_HOST}/material/all`, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`
      }
    });
    return response;
  } catch (error) {
    console.log("Error get all materials: ", error);
    return error as any;
  }
};

export const getAllMaterialType = async (): Promise<IMaterialType[]> => {
  const response: GenericResponse<IMaterialType[]> = await API.get(`/material/all/type`);
  if (response.success) return response.data;
  throw new Error(response?.message || "Error al obtener listado de materiales");
};

export const getAllMaterialTransportType = async (): Promise<IMaterialTransportType[]> => {
  const response: GenericResponse<IMaterialTransportType[]> =
    await API.get(`/material/all/transport`);
  if (response.success) return response.data;
  throw new Error(response?.message || "Error al obtener listado de materiales de transporte");
};

export const getMaterialById = async (id: string): Promise<IMaterial[]> => {
  const response: GenericResponse<IMaterial[]> = await API.get(`${config.API_HOST}/material/` + id);
  if (response.success) return response.data;
  throw new Error(response?.message || "Error al obtener el material por id");
};

export const createMaterialForm = (data: IMaterial, formImages: CustomFile[]) => {
  const form = new FormData();
  const body: any = { ...data };
  // const hasImage = formImages.length > 0
  // if (!hasImage) {
  //   throw new Error("At least one image file is required.");
  // }

  body.images = formImages?.map((file: any, index) => ({
    docReference: file.docReference || `image${index + 1}`,
    uid: file?.uid,
    url_archive: file?.url_archive
  }));

  form.append("body", JSON.stringify(body));

  formImages.forEach((file: CustomFile, index: number) => {
    if (file?.uid) {
      form.append(`image${index + 1}`, file);
    } else {
      console.warn(`Image ${index + 1} is undefined.`);
    }
  });

  return form;
};

export const addMaterial = async (
  data: IMaterial,
  formImages: CustomFile[]
): Promise<AxiosResponse<any, any>> => {
  try {
    const form = createMaterialForm(data, formImages);
    const response = await axios.post(`${config.API_HOST}/material/create`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json, text/plain, */*"
      }
    });
    return response;
  } catch (error) {
    console.log("Error creating material: ", error);
    throw error as any;
  }
};
export const updateMaterial = async (
  data: IMaterial,
  formImages: CustomFile[]
): Promise<AxiosResponse<any, any>> => {
  try {
    const form = createMaterialForm(data, formImages);
    const response = await axios.put(`${config.API_HOST}/material/update`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json, text/plain, */*"
      }
    });
    console.log("RESPONSE updateMaterial", response);
    return response;
  } catch (error) {
    console.log("Error updating material: ", error);
    throw error as any;
  }
};

export const updateMaterialStatus = async (
  location_id: string,
  active: string
): Promise<AxiosResponse<any, any>> => {
  try {
    const form = new FormData();
    const body: any = { material_id: location_id, active: active };
    form.append("body", JSON.stringify(body));
    const response = await axios.put(`${config.API_HOST}/material/updatestatus`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json, text/plain, */*"
      }
    });
    return response;
  } catch (error) {
    console.log("Error updating material: ", error);
    throw error as any;
  }
};
