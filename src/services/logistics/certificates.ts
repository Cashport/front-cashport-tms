import { GenericResponse } from "@/types/global/IGlobal";
import { IGetCertificate } from "@/types/logistics/certificate/certificate";
import { API } from "@/utils/api/api";

export const getDocumentsByEntityType = async (
  entityType: string = "1"
): Promise<IGetCertificate[]> => {
  try {
    const response: GenericResponse<IGetCertificate[]> = await API.get(
      `/certificate/documentsentity/${entityType}`
    );
    return response.data;
  } catch (error) {
    console.log("Error get Certificates: ", error);
    return error as any;
  }
};
