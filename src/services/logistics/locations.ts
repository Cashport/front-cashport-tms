import axios, { AxiosResponse } from "axios";
import { API } from "@/utils/api/api";
import {
  ICity,
  IEntityType,
  IGroupLocation,
  Data,
  ILocation,
  ILocationTypes,
  IState
} from "@/types/logistics/schema";
import { CertificateType, DocumentCompleteType } from "@/types/logistics/certificate/certificate";
import { GenericResponse } from "@/types/global/IGlobal";
import { LocationData } from "@/components/molecules/tabs/logisticsForms/grouplocationForm/grouplocationFormTab.mapper";

export const getAllLocations = async (): Promise<Data> => {
  try {
    const response: Data = await API.get(`/logistic-location/all/locations`);
    return response;
  } catch (error) {
    console.log("Error creating new location: ", error);
    return error as any;
  }
};

export const getLocationById = async (id: string): Promise<LocationData[]> => {
  const response: GenericResponse<LocationData[]> = await API.get(
    `/logistic-location/location/` + id
  );
  if (response.success) return response.data;
  throw new Error(response?.message || "Error");
};

export const getAllStatesByCountry = async (idcountry: string = "1"): Promise<IState[]> => {
  const response: GenericResponse<IState[]> = await API.get(
    `/logistic-location/all/statesbycountry/${idcountry}`
  );
  if (response.success) return response.data;
  throw new Error(response?.message || "Error");
};

export const getAllCitiesByState = async (idstate: string = "1"): Promise<ICity[]> => {
  idstate = idstate.replace("city-", "");
  const response: GenericResponse<ICity[]> = await API.get(
    `/logistic-location/all/citiesbystate/${idstate}`
  );
  if (response.success) return response.data;
  throw new Error(response?.message || "Error");
};

export const getAllLocationTypes = async (): Promise<ILocationTypes[]> => {
  const response: GenericResponse<ILocationTypes[]> = await API.get(
    `/logistic-location/all/location-types`
  );
  if (response.success) return response.data;
  throw new Error(response?.message || "Error");
};

export const getAllGroupByLocation = async (): Promise<IGroupLocation[]> => {
  const response: GenericResponse<IGroupLocation[]> = await API.get(
    `/logistic-location/all/group-location`
  );
  if (response.success) return response.data;
  throw new Error(response?.message || "Error");
};

export const getAllSecureRoutes = async (): Promise<Data> => {
  try {
    const response: Data = await API.get(`/logistic-location/all/secure-routes`);
    return response;
  } catch (error) {
    console.log("Error getAllSecureRoutes: ", error);
    return error as any;
  }
};

export const getAllEntityType = async (): Promise<IEntityType[]> => {
  try {
    const response: Data = await API.get(`/logistic-location/all/entity-type`);
    const res: IEntityType[] = response.data;
    return res;
  } catch (error) {
    console.log("Error getAllEntityType: ", error);
    return error as any;
  }
};

export const getAllDocumentsType = async (): Promise<CertificateType[]> => {
  const response: GenericResponse<CertificateType[]> = await API.get(
    `/logistic-location/all/documents-type`
  );
  if (response.success) return response.data;
  throw new Error(response.message);
};

export const createLocationForm = (data: ILocation, files: DocumentCompleteType[]) => {
  const form = new FormData();
  const body: any = { ...data };
  body.files = files;

  form.append("body", JSON.stringify(body));

  files.forEach((file) => {
    if (file.file) {
      form.append(`file-for-${file.id}`, file.file);
    } else {
      console.warn(`File with id ${file.id} is undefined.`);
    }
  });

  return form;
};

export const addLocation = async (
  data: ILocation,
  files: DocumentCompleteType[]
): Promise<GenericResponse> => {
  try {
    const form = createLocationForm(data, files);
    const response: GenericResponse = await API.post(`/logistic-location/create/locations`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json, text/plain, */*"
      }
    });
    return response;
  } catch (error) {
    console.log("Error creating location: ", error);
    throw error as any;
  }
};
export const updateLocation = async (
  data: ILocation,
  files: DocumentCompleteType[]
): Promise<GenericResponse> => {
  try {
    const form = createLocationForm(data, files);
    const response: GenericResponse = await API.put(`/logistic-location/update/locations`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json, text/plain, */*"
      }
    });
    return response;
  } catch (error) {
    console.log("Error updating location: ", error);
    throw error as any;
  }
};

export const updateLocationStatus = async (
  location_id: string,
  active: string
): Promise<GenericResponse> => {
  try {
    const form = new FormData();
    const body: any = { location_id: location_id, active: active };
    form.append("body", JSON.stringify(body));
    const response: GenericResponse = await API.put(
      `/logistic-location/updatestatus/locations`,
      form,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json, text/plain, */*"
        }
      }
    );
    return response;
  } catch (error) {
    console.log("Error updating location: ", error);
    throw error as any;
  }
};

export const addDocumentsType = async (formdata: FormData): Promise<GenericResponse> => {
  try {
    const response: GenericResponse = await API.post(
      `/logistic-location/create/documents-type`,
      formdata,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json, text/plain, */*"
        }
      }
    );
    return response;
  } catch (error) {
    console.log("Error creating documenttype: ", error);
    throw error as any;
  }
};
