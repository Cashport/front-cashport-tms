import axios, { AxiosResponse } from "axios";
import { API } from "@/utils/api/api";
import { CreateDriver, IFormGeneralDriver, IListData } from "@/types/logistics/schema";
import { FileObject } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import { GenericResponse } from "@/types/global/IGlobal";
import { DocumentCompleteType } from "@/types/logistics/certificate/certificate";

export const getAllDrivers = async ({ providerId }: { providerId: number }): Promise<any[]> => {
  const response: GenericResponse<any[]> = await API.get(`/driver/provider/${providerId}`);
  if (response.success) return response.data;
  throw response;
};

export const getDriverById = async (id: string): Promise<any> => {
  const response: GenericResponse = await API.get(`/driver/${id}`);
  if (response.success) return response.data;
  throw new Error(response?.message || "Error");
};

export const createDriverForm = (
  generalData: IFormGeneralDriver,
  logo: FileObject[],
  files: DocumentCompleteType[]
) => {
  const form = new FormData();
  const body: any = generalData;

  body.features =
    generalData.trip_type.map((tripType: any) => ({
      id: tripType.value
    })) ?? [];
  body.logo = logo
    ? logo.map((file: any) => ({
        docReference: file.docReference,
        uid: file?.file?.uid
      }))
    : undefined;

  const expiration = files.find((f) => !f.expirationDate && f.expiry);

  if (expiration) {
    throw new Error(`El documento ${expiration.description} debe tener una fecha de vencimiento`);
  }

  body.files = files;
  form.append("body", JSON.stringify({ ...body, rh: body.rhval as any }));
  logo && form.append("logo", logo[0].file as unknown as File);

  files.forEach((file) => {
    if (file.file) {
      form.append(`file-for-${file.id}`, file.file);
    } else {
      console.warn(`File with id ${file.id} is undefined.`);
    }
  });
  return form;
};

export const updateDriver = async (
  generalData: IFormGeneralDriver,
  logo: FileObject[],
  files: DocumentCompleteType[]
): Promise<CreateDriver> => {
  try {
    const form = createDriverForm(generalData, logo, files);
    const response: GenericResponse<CreateDriver> = await API.put(`/driver/update`, form);

    if (response.success) {
      return response.data;
    }

    throw new Error(response.message || "Error al editar un conductor");
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error desconocido al editar un conductor"
    );
  }
};

export const addDriver = async (
  generalData: IFormGeneralDriver,
  logo: FileObject[],
  files: DocumentCompleteType[]
): Promise<CreateDriver> => {
  try {
    const form = createDriverForm(generalData, logo, files);
    const response: GenericResponse<CreateDriver> = await API.post(`/driver/create`, form);

    if (response.success) {
      return response.data;
    }

    throw new Error(response.message || "Error al crear un conductor");
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error desconocido al crear un conductor"
    );
  }
};

export const updateDriverStatus = async (
  id: string,
  status: number
): Promise<AxiosResponse<any, any>> => {
  const response: GenericResponse = await API.put(`/driver/update-status/${id}`, {
    status
  });
  if (response.success) return response.data;
  throw new Error(response.message || "Error al actualizar el estado del conductor");
};

export const getTripTypes = async (): Promise<any[]> => {
  const response: GenericResponse<any[]> = await API.get(`/driver/features`);
  if (response.success) return response.data;
  throw new Error(response?.message || "Error");
};
