import { GenericResponse } from "@/types/global/IGlobal";
import { IApprovalType, IApprover, IClient } from "@/types/logistics/schema";
import { API } from "@/utils/api/api";

export const getTypes = async (): Promise<IApprovalType[]> => {
  try {
    const response: GenericResponse<IApprovalType[]> = await API.get(`/pricing-approval/types`);
    return response.data;
  } catch (error) {
    console.error("Error get pricing approval types: ", error);
    throw error as any;
  }
};

export const getApprovers = async (): Promise<IApprover[]> => {
  try {
    const response: GenericResponse<IApprover[]> = await API.get(`/pricing-approval/approvers`);
    return response.data;
  } catch (error) {
    console.error("Error get pricing approval approvers: ", error);
    throw error as any;
  }
};

export interface IApprovalRequest {
  id_approval_type: number;
  pricings: {
    carrier_request_id: number;
    quantity: number;
    comparation_pricings: number[];
  }[];
  approvers: {
    id_user: number;
  }[];
  send_single_source: boolean;
  is_another_contract_active: boolean;
  is_provider_recommended_by_sustainability: number;
  tercerization_motive: string;
  exists_another_provider_in_zone: boolean;
  subcontractor_ensure: boolean;
  observations: string;
}

export const createApproval = async (requestData: IApprovalRequest, file?: File): Promise<void> => {
  const form = new FormData();
  form.append("request", JSON.stringify(requestData));
  if (file) {
    form.append("files", file);
  }
  try {
    const response: GenericResponse<void> = await API.post(`/pricing-approval`, form, {
      headers: {
        "content-type": "multipart/form-data",
        Accept: "application/json, text/plain, */*"
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error creating pricing approval: ", error);
    throw error as any;
  }
};
