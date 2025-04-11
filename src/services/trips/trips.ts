import { createFormDataFinalizeTrip } from "@/components/molecules/modals/ModalBillingMT/controllers/createFormData";
import { createFormData } from "@/components/molecules/modals/ModalGenerateActionTO/FinalizeTrip/controllers/createFormData";
import { GenericResponse } from "@/types/global/IGlobal";
import { API } from "@/utils/api/api";

export interface IGetTripDetails {
  MT: string[];
  carrier_id: number;
  id: number;
  plate_number: string;
  provider: string;
}

export const getTripDetails = async (idTrip: number): Promise<IGetTripDetails | undefined> => {
  const response: GenericResponse<IGetTripDetails> = await API.get(
    `/transfer-request/trip-details/${idTrip}`
  );
  if (response.success) return response.data;
  throw new Error(response.message);
};

export const sendFinalizeTrip = async (form: any, idTrip: number): Promise<boolean | undefined> => {
  try {
    const formData = createFormDataFinalizeTrip(form);
    const response: any = await API.post(`/transfer-request/add-mt-trip/${idTrip}`, formData, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data"
      }
    });
    if (response?.data) return true;
    return false;
  } catch (error) {
    throw new Error("Hubo un error");
  }
};
export const getCarriersTripsDetails = async (idTR: number): Promise<any[] | undefined> => {
  try {
    const response: GenericResponse<any> = await API.get(`/transfer-request/trips-details/${idTR}`);
    console.log("response getCarriersTripsDetails", response);
    if (response.data) {
      return response?.data;
    } else {
      console.log(`Error getCarriersTripsDetails: `);
    }
  } catch (error) {
    console.log(`Error getCarriersTripsDetails: `, error);
    return error as any;
  }
};

export const sendFinalizeTripAllCarriers = async (
  form: any,
  idTR: number
): Promise<boolean | undefined> => {
  try {
    const formData = createFormData(form);

    const response: GenericResponse = await API.post(
      `/transfer-request/finalize-trip/${idTR}`,
      formData,
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "multipart/form-data"
        }
      }
    );
    if (response?.data) return true;
    return false;
  } catch (error) {
    console.log(`Error sendFinalizeTrip: `, error);
    return error as any;
  }
};

interface IPostAddMTTRipTracking {
  trId: number;
  documentsMTs: {
    tripId: number;
    file: string;
  }[];
  commentary: string;
  files: {
    name: string;
    file: File;
  }[];
}

export const postAddMTTRipTracking = async ({
  trId,
  documentsMTs,
  commentary,
  files
}: IPostAddMTTRipTracking) => {
  const formData = new FormData();

  const request = {
    documentsMTs,
    commentary
  };

  formData.append("request", JSON.stringify(request));

  // for each file in files, append it to formData
  files.forEach((file) => {
    formData.append(file.name, file.file);
  });

  try {
    const response: any = await API.post(
      `${config.API_HOST}/transfer-request/add-mt-trip-tracking/${trId}`,
      formData
    );
    if (response?.data) return true;
  } catch (error) {
    console.log(`Error postAddMTTRipTracking: `, error);
    throw new Error(typeof error === "string" ? error : "An unknown error occurred");
  }
};
