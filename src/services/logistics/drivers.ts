import { AxiosResponse } from "axios";
import { API } from "@/utils/api/api";
import { CreateDriver, IAPIDriver, IGeneralDriverSubmit } from "@/types/logistics/schema";
import { FileObject } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import { GenericResponse } from "@/types/global/IGlobal";
import { IUploadRequirementstTableRow } from "@/components/organisms/logistics/proveedores/ModalUploadRequirements/ModalUploadRequirements";

export const getAllDrivers = async ({ providerId }: { providerId: number }): Promise<any[]> => {
  const response: GenericResponse<any[]> = await API.get(`/driver/provider/${providerId}`);
  if (response.success) return response.data;
  throw response;
};

export const getDriverById = async (id: string): Promise<IAPIDriver> => {
  const response: GenericResponse<IAPIDriver> = await API.get(`/driver/${id}`);
  if (response.success) return response.data;
  throw new Error(response?.message || "Error");
};

export const createDriverForm = (
  generalData: IGeneralDriverSubmit,
  logo?: FileObject[],
  files?: IUploadRequirementstTableRow[]
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

  form.append("body", JSON.stringify({ ...body, rh: body.rhval as any }));
  logo && form.append("logo", logo[0].file as unknown as File);

  files?.forEach((file) => {
    if (file && file.file) {
      form.append(file.fileName, file.file);
    }
  });
  return form;
};

export const updateDriver = async (
  generalData: IGeneralDriverSubmit,
  logo: FileObject[],
  files?: IUploadRequirementstTableRow[]
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

interface IGeneralData extends IGeneralDriverSubmit {
  company_id: string;
}

export const addDriver = async (
  generalData: IGeneralData,
  logo?: FileObject[],
  files?: IUploadRequirementstTableRow[]
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
