import { AxiosResponse } from "axios";
import { API } from "@/utils/api/api";
import {
  ICreateLocation,
  ICities,
  IResponseAddAddressToLocation
} from "@/types/locations/ILocations";
import { MessageType } from "@/context/MessageContext";

export const fetchAllLocations = async (): Promise<ICities[]> => {
  try {
    const { data, status }: AxiosResponse = await API.get<ICities>(`/location`);
    if (status === 200) return data;
    return [];
  } catch (error) {
    return [];
  }
};

export const addAddressToLocation = async (
  data: {
    address: string;
    id: number;
    complement: string;
  },
  projectId: number,
  // eslint-disable-next-line no-unused-vars
  showMessage: (type: MessageType, content: string) => void
): Promise<IResponseAddAddressToLocation> => {
  const modelData: ICreateLocation = {
    address: data.address,
    city: data.id,
    complement: data.complement,
    project_id: projectId
  };

  try {
    const response: IResponseAddAddressToLocation = await API.post(`/location`, modelData);

    if (response.success !== false) {
      showMessage("success", "Direccion creada exitosamente.");
    } else {
      throw new Error("error");
    }
    return response;
  } catch (error) {
    console.warn("error creating new location: ", error);
    showMessage("error", "Oops ocurrio un error creando la dirección.");
    return error as any;
  }
};

export const getOneLocation = async (locationId: number, projectId: number): Promise<any> => {
  try {
    const response: AxiosResponse = await API.get(`/location/${locationId}/project/${projectId}`);
    return response;
  } catch (error) {
    console.warn("Error getting location: ", error);
    return error as any;
  }
};
