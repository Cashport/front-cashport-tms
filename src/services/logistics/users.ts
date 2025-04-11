import axios, { AxiosResponse } from "axios";
import { API } from "@/utils/api/api";
import { IFormGeneralUser } from "@/types/logistics/schema";
import { FileObject } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import { DocumentCompleteType } from "@/types/logistics/certificate/certificate";
import { GenericResponse } from "@/types/global/IGlobal";

export const getAllUsers = async (): Promise<GenericResponse> => {
  try {
    const response: GenericResponse = await API.get(`/logistic-user/all`);
    return response;
  } catch (error) {
    console.log("Error getAllUsers: ", error);
    return error as any;
  }
};

export const getAllRoles = async (): Promise<GenericResponse> => {
  try {
    const response: GenericResponse = await API.get(`/logistic-user/all/roles`);
    return response;
  } catch (error) {
    console.log("Error getAllRoles: ", error);
    return error as any;
  }
};

export const getAllCarriers = async (): Promise<GenericResponse> => {
  try {
    const response: GenericResponse = await API.get(`/logistic-user/all/carriers`);
    return response;
  } catch (error) {
    console.log("Error getAllCarriers: ", error);
    return error as any;
  }
};

export const getAllPsl = async (): Promise<GenericResponse> => {
  try {
    const response: GenericResponse = await API.get(`/logistic-user/all/psl`);
    return response;
  } catch (error) {
    console.log("Error getAllPsl: ", error);
    return error as any;
  }
};

export const getAllCostCenterByPsl = async (id: string): Promise<GenericResponse> => {
  try {
    const response: GenericResponse = await API.get(`/logistic-user/all/psl/${id}`);
    return response;
  } catch (error) {
    console.log("Error getAllCostCenterByPsl: ", error);
    return error as any;
  }
};

export const getUserById = async (id: string): Promise<GenericResponse> => {
  try {
    const response: GenericResponse = await API.get(`/logistic-user/${id}`);
    return response;
  } catch (error) {
    console.log("Error get User: ", error);
    return error as any;
  }
};
export const createUserForm = (generalData: IFormGeneralUser, logo: FileObject[]) => {
  const form = new FormData();
  const body: any = generalData;

  body.logo = logo
    ? logo.map((file: any) => ({
        docReference: file.docReference,
        uid: file?.file?.uid
      }))
    : undefined;

  form.append("body", JSON.stringify({ ...body, rh: body.rhval as any }));
  logo && form.append("logo", logo[0].file as unknown as File);

  return form;
};

export const updateUser = async (
  generalData: IFormGeneralUser,
  logo: FileObject[]
): Promise<AxiosResponse<any, any>> => {
  try {
    const form = createUserForm(generalData, logo);
    const response = await API.put(`/logistic-user/update`, form);
    return response;
  } catch (error) {
    console.log("Error update User: ", error);
    return error as any;
  }
};

export const addUser = async (
  generalData: IFormGeneralUser,
  logo: FileObject[]
): Promise<AxiosResponse<any, any>> => {
  try {
    const form = createUserForm(generalData, logo);
    const response = await API.post(`/logistic-user/create`, form, {
      headers: {
        "content-type": "multipart/form-data",
        Accept: "application/json, text/plain, */*"
      }
    });
    return response;
  } catch (error) {
    console.log("Error create User: ", error);
    throw error as any;
  }
};

export const updateUserStatus = async (
  user_id: string,
  active: string
): Promise<GenericResponse> => {
  try {
    const form = new FormData();
    const body: any = { user_id: user_id, active: active };
    form.append("body", JSON.stringify(body));
    const response: GenericResponse = await API.put(`/logistic-user/updatestatus`, form);
    return response;
  } catch (error) {
    console.log("Error updating user: ", error);
    throw error as any;
  }
};
