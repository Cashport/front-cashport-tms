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
