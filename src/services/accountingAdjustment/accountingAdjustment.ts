import { DiscountRequestBody } from "@/types/accountingAdjustment/IAccountingAdjustment";
import { IFormDigitalRecordModal } from "@/components/molecules/modals/DigitalRecordModal/DigitalRecordModal";
import { API } from "@/utils/api/api";
import { AxiosResponse } from "axios";
import config from "@/config";

export interface IUser {
  label: string;
  value: string;
  full_phone: string;
}

interface IAttachments {
  id: number;
  name: string;
}

interface DigitalRecordResponse {
  usuarios: IUser[];
  asunto: string;
  attachments: IAttachments[];
}

interface RadicationData {
  invoices_id: number[];
  radication_type: string;
  accept_date: string;
  comments: string;
}

export const createAccountingAdjustment = async (
  requestBody: DiscountRequestBody
): Promise<AxiosResponse<any>> => {
  try {
    const response: AxiosResponse<any> = await API.post(
      `/financial-discount/project/${requestBody.project_id}/client/${requestBody.client_id}`,
      requestBody,
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json; charset=utf-8",
        }
      }
    );
    return response.data;
  } catch (error) {
    return error as any;
  }
};
export const applyAccountingAdjustment = async (
  adjustmentData: string,
  docFiles: File[] | null,
  projectId: string,
  clientId: string,
  type: number
): Promise<AxiosResponse<any>> => {
  const formData = new FormData();
  formData.append("adjustment_data", adjustmentData);
  formData.append("type", type.toString());
  if (docFiles) {
    docFiles.forEach((file) => {
      formData.append("doc", file);
    });
  }

  const response: AxiosResponse<any> = await API.post(
    `/invoice/adjusment/project/${projectId}/client/${clientId}`,
    formData,
    {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data",
      }
    }
  );
  return response;
};

export const changeStatusInvoice = async (
  statusName: string,
  invoiceIds: number[],
  comments: string,
  docFiles: File[] | null,
  projectId: number,
  clientId: number
): Promise<
  AxiosResponse<{
    message: string;
    data: any;
  }>
> => {
  const formData = new FormData();
  formData.append("status_name", statusName);
  formData.append("invoice_ids", JSON.stringify(invoiceIds));
  formData.append("comments", comments);
  if (docFiles) {
    docFiles.forEach((file) => {
      formData.append("files", file);
    });
  }

  const response: AxiosResponse<{
    message: string;
    data: any;
  }> = await API.post(
    `/invoice/project/${projectId}/client/${clientId}/update_status`,
    formData,
    {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data",
      }
    }
  );
  return response;
};

export const reportInvoiceIncident = async (
  invoicesId: number[],
  comments: string,
  motiveId: string,
  files: File[] | null,
  clientId: string
): Promise<AxiosResponse<any>> => {

  const formData = new FormData();
  formData.append("invoices_id", JSON.stringify(invoicesId));
  formData.append("comments", comments);
  formData.append("motive_id", motiveId);

  if (files) {
    files.forEach((file) => {
      formData.append("files", file);
    });
  }

  const response: AxiosResponse<any> = await API.post(
    `/invoice/incident/client/${clientId}`,
    formData,
    {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data",
      }
    }
  );
  return response;
};

export const getDigitalRecordFormInfo = async (
  projectId: number,
  clientId: string
): Promise<DigitalRecordResponse> => {
  try {
    const response: DigitalRecordResponse = await API.get(
      `${config.API_HOST}/client/digital-record?projectId=${projectId}&clientId=${clientId}`
    );
    return response;
  } catch (error) {
    console.error("Error getting digital record form info", error);
    throw error;
  }
};

export const sendDigitalRecord = async (clientUUID: string, data: IFormDigitalRecordModal) => {
  try {
    const response = await API.post(`${config.API_HOST}/client/digital-record-background`, {
      clientUUID,
      to: data.forward_to.map((user) => user.value)
    });
    return response;
  } catch (error) {
    console.error("Error sending digital record", error);
    throw error;
  }
};

export const radicateInvoice = async (
  radicationData: RadicationData,
  files: File[],
  clientId: number
): Promise<AxiosResponse<any>> => {

  const formData = new FormData();
  formData.append("invoices_id", JSON.stringify(radicationData.invoices_id));
  formData.append("radication_type", radicationData.radication_type);
  formData.append("accept_date", radicationData.accept_date);
  formData.append("comments", radicationData.comments);

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response: AxiosResponse<any> = await API.post(
    `/invoice/radication/client/${clientId}`,
    formData,
    {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data",
      }
    }
  );

  return response;
};
