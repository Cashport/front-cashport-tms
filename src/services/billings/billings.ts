import axios from "axios";
import { API, getIdToken } from "@/utils/api/api";
import config from "@/config";
import { GenericResponse } from "@/types/global/IGlobal";
import { UploadInvoiceForm } from "@/components/molecules/modals/ModalBillingAction/UploadInvoice/controllers/uploadinvoice.types";
import createFormData from "@/components/molecules/modals/ModalBillingAction/UploadInvoice/controllers/createFormData";
import {
  IBillingDetails,
  IBillingsRequestList,
  IPreauthorizedRequest,
  PreAuthorizationRequestData
} from "@/types/logistics/billing/billing";
import { PreauthorizeTripForm } from "@/components/molecules/modals/ModalGenerateActionTO/PreauthorizeTrip/controllers/preauthorizetrip.types";
import createPreauthorizationsFormData from "@/components/molecules/modals/ModalGenerateActionTO/PreauthorizeTrip/controllers/createFormData";

export const getAllBillingList = async (): Promise<IBillingsRequestList[]> => {
  try {
    const response: GenericResponse<IBillingsRequestList[]> =
      await API.get(`/logistic-billing/all`);
    return response.data;
  } catch (error) {
    console.log("Error get all getAllBillingList: ", error);
    return error as any;
  }
};

export const getBillingDetailsById = async (id: string): Promise<IBillingDetails | undefined> => {
  try {
    const response: GenericResponse<IBillingDetails> = await API.get(`/logistic-billing/${id}`);
    if (response.data) {
      return response.data;
    } else {
      console.log(`Error: ${response.data}`);
    }
  } catch (error) {
    console.log(`Error getBillingDetailsById: `, error);
    return error as any;
  }
};

export const getAceptBilling = async (idBilling: number): Promise<boolean | undefined> => {
  try {
    const response: GenericResponse<boolean> = await API.get(
      `/logistic-billing/aceptBilling/${idBilling}`
    );
    console.log("response getAceptBilling", response);
    if (response.data) {
      return response.data;
    } else return false;
  } catch (error) {
    console.log(`Error getAceptBilling: `, error);
    return error as any;
  }
};

export const postRejectBilling = async (
  idBilling: number,
  observation: string
): Promise<string | undefined> => {
  const body = {
    observation
  };
  const response: GenericResponse<string> = await API.post(
    `/logistic-billing/reject/${idBilling}`,
    body
  );
  if (response.success) return response.message;
  throw new Error(response?.message);
};

export const getPreauthorizedInfo = async (idBilling: number): Promise<any | undefined> => {
  try {
    const response: GenericResponse<any> = await API.get(
      `/logistic-billing/modal-invoice/${idBilling}`
    );
    if (response.data) {
      return response?.data;
    } else {
      console.log(`Error getPreauthorizedInfo: `);
    }
  } catch (error) {
    console.log(`Error getPreauthorizedInfo: `, error);
    return error as any;
  }
};

export const sendInvoices = async (
  dataForm: UploadInvoiceForm,
  idBilling: number
): Promise<boolean | undefined> => {
  try {
    const token = await getIdToken();
    const response: any = await axios.post(
      `${config.API_HOST}/logistic-billing/invoice/${idBilling}`,
      createFormData(dataForm),
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      }
    );
    if (response.data) return true;
    return false;
  } catch (error) {
    return false;
  }
};

export const sendPreauthorizations = async (
  dataForm: PreauthorizeTripForm,
  idBilling: number
): Promise<boolean | undefined> => {
  try {
    const token = await getIdToken();
    const response: any = await axios.post(
      `${config.API_HOST}/logistic-billing/preauthorize/${idBilling}`,
      createPreauthorizationsFormData(dataForm),
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      }
    );
    if (response.data) return true;
    return false;
  } catch (error) {
    return false;
  }
};
