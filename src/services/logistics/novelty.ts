import { GenericResponse } from "@/types/global/IGlobal";
import { INovelty, INoveltyBody, INoveltyType, IOvercost } from "@/types/novelty/INovelty";
import { API } from "@/utils/api/api";

export const getNoveltyDetail = async (id: number): Promise<INovelty | {}> => {
  try {
    const { success, data }: GenericResponse<INovelty> = await API.get(`/novelty/detail/${id}`);
    if (success) return data;
    return {};
  } catch (error) {
    console.error("Error get request/details/:id/: ", error);
    throw error as any;
  }
};

export const aprobeOrRejectDetail = async (id: number, isAprobe: boolean): Promise<boolean> => {
  try {
    const { success }: GenericResponse<boolean> = await API.post("/novelty/aprobe-or-reject", {
      id,
      isAprobe
    });
    if (success) return true;
    return false;
  } catch (error) {
    console.error("Error get novelty/aprobe-or-reject/: ", error);
    throw error as any;
  }
};

export const getNoveltyTypes = async (): Promise<INoveltyType[]> => {
  try {
    const { success, data }: GenericResponse<INoveltyType[]> = await API.get("/novelty-type/all");
    if (success) return data;
    return [];
  } catch (error) {
    console.error("Error get novelty-type/all/: ", error);
    throw error as any;
  }
};

export const createNovelty = async (body: INoveltyBody): Promise<{ id: number } | null> => {
  try {
    const { success, data }: GenericResponse<{ id: number }> = await API.post(
      "/novelty/create",
      body
    );
    if (success) return data;
    return null;
  } catch (error) {
    console.error("Error get novelty/aprobe-or-reject/: ", error);
    throw error as any;
  }
};

export const updateNovelty = async (body: INoveltyBody) => {
  try {
    const { success }: GenericResponse<boolean> = await API.post("/novelty/update", body);
    if (success) return true;
    return false;
  } catch (error) {
    console.error("Error update novelty/: ", error);
    throw error as any;
  }
};

export const createNoveltyEvidences = async (noveltyId: number, files: File[]) => {
  try {
    const formData = new FormData();
    formData.append("noveltyId", String(noveltyId));

    files.forEach((file) => {
      formData.append("files", file);
    });
    const { success }: GenericResponse<boolean> = await API.post(
      `/novelty-evidence/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );
    if (success) return true;
    return false;
  } catch (error) {
    console.error("Error upload novelty-evidence/upload: ", error);
    throw error as any;
  }
};

export const getOvercosts = async (
  idVehicleType: number,
  idCarrier: number
): Promise<IOvercost[]> => {
  const res: GenericResponse<IOvercost[]> = await API.get(
    `/novelty-type/overcost/${idVehicleType}/${idCarrier}`
  );
  if (res.success) return res.data;
  throw new Error(res.message || "ocurrió un error al obtener los costos de sobrecargo");
};
