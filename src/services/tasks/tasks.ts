import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { ITaskStatus, ITaskTypes } from "@/types/tasks/ITasks";

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
