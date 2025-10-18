import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { ITaskStatus, ITaskTypes, ITaskDetail, ITaskApprovalResponse } from "@/types/tasks/ITasks";

export const getTasksStatus = async (): Promise<GenericResponse<ITaskStatus[]>> => {
  try {
    const response: GenericResponse<ITaskStatus[]> = await API.get(`/task/get-status`);
    return response;
  } catch (error) {
    console.log("Error getTasksStatus:", error);
    return error as any;
  }
};

export const getTaskTypes = async (): Promise<GenericResponse<ITaskTypes[]>> => {
  try {
    const response: GenericResponse<ITaskTypes[]> = await API.get(`/task/get-types`);
    return response;
  } catch (error) {
    console.log("Error getTaskTypes:", error);
    return error as any;
  }
};

export const getTaskDetail = async (approvalId: number): Promise<GenericResponse<ITaskDetail>> => {
  try {
    const response: GenericResponse<ITaskDetail> = await API.get(
      `/pricing-approval/detail/${approvalId}`
    );
    return response;
  } catch (error) {
    console.error("Error getTaskDetail:", error);
    return error as any;
  }
};

export const updatePricingApprovalStatus = async (
  approvalId: number,
  status: "APPROVED" | "REJECTED"
): Promise<GenericResponse<ITaskApprovalResponse>> => {
  try {
    const response = await API.put(`/pricing-approval/${approvalId}/status`, { status });

    return {
      status: 200,
      message: `La solicitud ha sido ${response.data.toLowerCase() === "approved" ? "aprobada" : "rechazada"} correctamente`,
      data: response.data,
      success: true
    };
  } catch (error: any) {
    console.error("Error updating pricing approval status:", error);
    return error as any;
  }
};
