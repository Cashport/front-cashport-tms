import { API, getIdToken } from "@/utils/api/api";
import { IDataSection } from "@/types/portfolios/IPortfolios";
import { GenericResponse } from "@/types/global/IGlobal";

export const getPortfolioFromClient = async (
  projectId: number | undefined,
  clientId: number | undefined
) => {
  try {
    const response: GenericResponse = await API.get(
      `/portfolio/project/${projectId}/client/${clientId}`
    );
    return response.data as IDataSection;
  } catch (error) {
    console.warn("error creating new location: ", error);
    return error as any;
  }
};
