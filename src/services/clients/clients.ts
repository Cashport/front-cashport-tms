import axios, { AxiosError, AxiosResponse } from "axios";
import config from "@/config";
import { API, getIdToken } from "@/utils/api/api";
import {
  ClientFormType,
  IClient,
  IClientAxios,
  IClientFullResponse,
  ICreateClient,
  IUpdateClient
} from "@/types/clients/IClients";
import { IBillingPeriodForm } from "@/types/billingPeriod/IBillingPeriod";

import { SUCCESS } from "@/utils/constants/globalConstants";
import { IAddAddressData } from "@/types/locations/ILocations";
import { GenericResponse } from "@/types/global/IGlobal";
import { MessageType } from "@/context/MessageContext";
import { stringToBoolean } from "@/utils/utils";

// create

export const createClient = async (
  idProject: string,
  rawData: ClientFormType,
  billingPeriod: IBillingPeriodForm,
  documents: any[],
  locationResponse: IAddAddressData,
  // eslint-disable-next-line no-unused-vars
  showMessage: (type: MessageType, content: string) => void
): Promise<any> => {
  const { infoClient: data } = rawData;

  const formatLocations = JSON.stringify([locationResponse]);

  const modelData: ICreateClient = {
    nit: parseInt(data.nit),
    project_id: parseInt(idProject),
    client_name: data.client_name,
    business_name: data.business_name,
    phone: data.phone,
    condition_payment: data.condition_payment.value,
    email: data.email,
    radication_type: data.radication_type.value,
    document_type: data.document_type.value,
    locations: formatLocations,
    documents: documents,
    client_type_id:
      typeof data.client_type === "number" ? data.client_type : parseInt(data.client_type),
    holding_id: data.holding_id?.value === 0 ? undefined : data.holding_id?.value,
    day_flag: typeof billingPeriod === "string" ? undefined : billingPeriod.day_flag === "true",
    day: typeof billingPeriod === "string" ? undefined : billingPeriod.day,
    order: typeof billingPeriod === "string" ? undefined : billingPeriod.order?.toLowerCase(),
    day_of_week:
      typeof billingPeriod === "string" ? undefined : billingPeriod.day_of_week?.toLowerCase()
  };

  const formData = new FormData();
  // Agregar los campos del modelo de datos al objeto FormData
  Object.keys(modelData).forEach((key) => {
    if (key === "documents" && Array.isArray(modelData[key])) {
      modelData[key].forEach((file: File) => {
        formData.append("documents", file);
      });
    } else if (modelData[key] !== undefined && modelData[key] !== null && modelData[key] !== "") {
      formData.append(key, modelData[key]);
    }
  });

  try {
    const response: AxiosResponse | AxiosError = await API.post(`/client`, formData);

    if (response.status === SUCCESS) {
      showMessage("success", "El Cliente fue creado exitosamente.");
      return response;
    }

    return response;
  } catch (error) {
    console.warn("error creating new client: ", error);
    if (axios.isAxiosError(error)) {
      showMessage("error", error.response?.data?.message);
    }
    return error as AxiosError;
  }
};

export const getClientById = async (
  idUser: string,
  projectId: string
): Promise<IClientFullResponse> => {
  try {
    const response: IClientFullResponse = await API.get(`/client/${idUser}/project/${projectId}`);

    return response;
  } catch (error) {
    console.warn("error getting client by Id: ", error);
    return error as any;
  }
};

export const updateClient = async (
  idProject: string,
  clientId: number,
  rawData: ClientFormType,
  locationResponse: any,
  hasLocationChanged: boolean,
  // eslint-disable-next-line no-unused-vars
  showMessage: (type: MessageType, content: string) => void,
  billingPeriod?: IBillingPeriodForm
): Promise<any> => {
  const { infoClient: data } = rawData;

  const formatLocations = hasLocationChanged
    ? JSON.stringify([locationResponse])
    : JSON.stringify(locationResponse);

  const modelData: IUpdateClient = {
    business_name: data.business_name,
    phone: data.phone,
    condition_payment: data.condition_payment.value,
    email: data.email,
    radication_type: data.radication_type.value,
    document_type: data.document_type.value,
    locations: formatLocations,
    holding_id: data.holding_id.value,
    day_flag: stringToBoolean(billingPeriod?.day_flag),
    day: billingPeriod?.day,
    order: billingPeriod?.order?.toLowerCase(),
    day_of_week: billingPeriod?.day_of_week?.toLowerCase()
  };

  const formData = new FormData();

  Object.keys(modelData).forEach((key) => {
    if (modelData[key] !== undefined && modelData[key] !== null && modelData[key] !== "") {
      formData.append(key, modelData[key]);
    }
  });

  try {
    const response: AxiosResponse | AxiosError = await API.put(
      `/client/${clientId}/project/${idProject}`,
      modelData
    );

    if (response.status === SUCCESS) {
      showMessage("success", "El Cliente fue actualizado exitosamente.");
      return response;
    }
    return response;
  } catch (error) {
    console.warn("error updating client: ", error);
    if (axios.isAxiosError(error)) {
      showMessage("error", error.response?.data?.message);
    }
    return error as AxiosError;
  }
};

export const deleteClientById = async (
  idUser: number,
  projectId: string,
  // eslint-disable-next-line no-unused-vars
  showMessage: (type: MessageType, content: string) => void,
  onClose: () => void
): Promise<IClientFullResponse> => {
  try {
    const response: IClientFullResponse = await API.delete(
      `/client/${idUser}/project/${projectId}`
    );

    if (response.status === SUCCESS) {
      showMessage("success", "El Cliente fue eliminado exitosamente.");
      onClose();
    } else {
      showMessage("error", "Oops ocurrio un error.");
      onClose();
    }

    return response;
  } catch (error) {
    console.warn("error deleting client by Id: ", error);
    return error as any;
  }
};

type PropsGetAllByProject = {
  idProject: string;
  city?: number[];
  holding?: number[];
  risk?: number[];
  payment_condition?: number[];
  radication_type?: number[];
  status?: number[];
};
export const getAllByProject = async (props: PropsGetAllByProject): Promise<IClient[]> => {
  const { city, holding, risk, payment_condition, radication_type, status, idProject } = props;
  const response: GenericResponse<IClient[]> = await API.get(`/client/project/${idProject}`, {
    params: {
      city,
      holding,
      risk,
      payment_condition,
      radication_type,
      status
    }
  });
  return response?.data;
};

export const changeClientStatus = async (
  clientId: string,
  newStatus: number,
  // eslint-disable-next-line no-unused-vars
  showMessage: (type: MessageType, content: string) => void
) => {

  try {
    const response: AxiosResponse | AxiosError = await API.put(
      `/client/change-status/${clientId}`,
      { status: newStatus },
    );

    if (response.status === 200) {
      showMessage("success", "Estado del cliente cambiado exitosamente.");
    } else {
      showMessage("error", "Oops, ocurrió un error cambiando el estado del cliente.");
    }
    return response;
  } catch (error) {
    console.warn("Error cambiando el estado del cliente: ", error);
    showMessage("error", "Oops, ocurrió un error cambiando el estado del cliente.");
    return error as AxiosError;
  }
};
