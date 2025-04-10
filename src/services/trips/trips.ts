import { createFormDataFinalizeTrip } from "@/components/molecules/modals/ModalBillingMT/controllers/createFormData";
import { createFormData } from "@/components/molecules/modals/ModalGenerateActionTO/FinalizeTrip/controllers/createFormData";
import config from "@/config";
import { GenericResponse } from "@/types/global/IGlobal";
import { API, getIdToken } from "@/utils/api/api";
import axios from "axios";

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
    const token = await getIdToken();
    const formData = createFormDataFinalizeTrip(form);
    const response: any = await axios.post(
      `${config.API_HOST}/transfer-request/add-mt-trip/${idTrip}`,
      formData,
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      }
    );
    console.log("sendFinalizeTrip res", response);
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
    const token = await getIdToken();
    const formData = createFormData(form);

    const response: any = await axios.post(
      `${config.API_HOST}/transfer-request/finalize-trip/${idTR}`,
      formData,
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
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
  idTrip: number;
  documentsMTs: {
    tripId: number;
    file: string;
  }[];
  commentary: string;
  files: File[];
}

export const postAddMTTRipTracking = async ({
  idTrip,
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
  files.forEach((file, i) => {
    formData.append(`MT-${i + 1}`, file);
  });

  try {
    const response: any = await API.post(
      `${config.API_HOST}/transfer-request/add-mt-trip-tracking/${idTrip}`,
      formData
    );
    if (response?.data) return true;
  } catch (error) {
    console.log(`Error postAddMTTRipTracking: `, error);
    throw new Error(typeof error === "string" ? error : "An unknown error occurred");
  }
};
