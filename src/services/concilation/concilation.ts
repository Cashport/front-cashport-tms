import {
  CreateIncidentResponse,
  dataConcilation,
  IInvoiceIncident
} from "@/types/concilation/concilation";
import { API } from "@/utils/api/api";

export const invoiceConciliation = async (
  files: File[],
  clientId: number,
  projectId: number
): Promise<dataConcilation> => {
  const formData = new FormData();
  console.log(files);

  files.forEach((file) => {
    formData.append("files", file);
  });
  formData.append("client_id", clientId.toString());
  formData.append("project_id", projectId.toString());

  const response: dataConcilation = await API.post(
    `/massive-action/invoice-conciliation`,
    formData,
    {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return response;
};

export const invoiceCreateIncident = async (
  files: File[],
  invoices: IInvoiceIncident[],
  comments: string,
  clientId: number
): Promise<CreateIncidentResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  formData.append("invoices", JSON.stringify(invoices));
  formData.append("comments", comments);
  formData.append("client_id", clientId.toString());

  const response: CreateIncidentResponse = await API.post(
    `/massive-action/invoice-create-incident`,
    formData,
    {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return response;
};
