import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponsePage } from "@/types/global/IGlobal";
import { ITask } from "@/types/tasks/ITasks";
import { ISelectFilterTasks } from "@/components/atoms/Filters/FiltersTasks/FiltersTasks";

export const useTasks = (
  filters: ISelectFilterTasks,
  searchQuery: string,
  page: number = 1,
  limit: number = 20
) => {
  const queryParams: string[] = [];

  queryParams.push(`page=${page}`);

  if (limit) {
    queryParams.push(`rowsPerPage=${limit}`);
  }

  if (searchQuery) {
    queryParams.push(`searchQuery=${searchQuery}`);
  }

  if (filters.statuses.length > 0) {
    const statusesParam = filters.statuses.map((status) => `${status}`).join(",");
    queryParams.push(`status=${statusesParam}`);
  }

  if (filters.taskTypes.length > 0) {
    const taskTypesParam = filters.taskTypes.map((type) => `${type}`).join(",");
    queryParams.push(`taskType=${taskTypesParam}`);
  }

  const requestUrl = `/task/get-all?${queryParams.join("&")}`;

  const { data, isLoading, mutate } = useSWR<GenericResponsePage<ITask[]>>(requestUrl, fetcher);

  return {
    data: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    mutate
  };
};
