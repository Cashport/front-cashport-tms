import { createFormDataFinalizeTrip } from "@/components/molecules/modals/ModalBillingMT/controllers/createFormData";
import { IParsedFormValues } from "@/components/molecules/modals/ModalBillingMT/controllers/formbillingmt.types";
import { createFormData } from "@/components/molecules/modals/ModalGenerateActionTO/FinalizeTrip/controllers/createFormData";
import { ICarrierAPI, IRequestAPI } from "@/components/molecules/modals/ModalGenerateActionTO/FinalizeTrip/FinalizeTrip";
import { GenericResponse } from "@/types/global/IGlobal";
import { API } from "@/utils/api/api";

interface IMT {
  id: number;
  name: string;
  url: string;
}
export interface IGetTripDetails {
  MT: IMT[];
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

export const getOtherRequirementDetails = async (
  idRequirement: number
): Promise<IRequestAPI | undefined> => {
  const response: GenericResponse<IRequestAPI> = await API.get(
    `/transfer-request/other-requirement-details/${idRequirement}`
  );
  if (response.success) return response.data;
  throw new Error(response.message);
};

export const addTripDocuments = async (form: IParsedFormValues[], idTrip: number): Promise<any> => {
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
    throw new Error("Hubo un error finalizando el viaje");
  }
};

export const addOtherRequirementDocuments = async (form: IParsedFormValues[], idOt: number): Promise<any> => {
  try {
    const formData = createFormDataFinalizeTrip(form);
    const response: any = await API.post(`/transfer-request/add-mt-other-requirement/${idOt}`, formData, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data"
      }
    });
    if (response?.data) return true;
    return false;
  } catch (error) {
    throw new Error("Hubo un error finalizando el viaje");
  }
};

export const getCarriersTripsDetails = async (idTR: number): Promise<any[] | undefined> => {
  try {
    const response: GenericResponse<any> = await API.get(`/transfer-request/trips-details/${idTR}`);
    if (response.data) {
      return response?.data;
    } else {
      console.log(`Error getCarriersTripsDetails: `);
    }
  } catch (error) {
    console.error(`Error getCarriersTripsDetails: `, error);
    return [];
  }
};

export const getTripsDetailsByCarrier = async (
  idTR: number,
  idCarrier: number
): Promise<ICarrierAPI | null> => {
  try {
    const response: GenericResponse<ICarrierAPI> = await API.get(
      `/transfer-request/trips-details/${idTR}/carrier/${idCarrier}`
    );
    if (response.data) {
      return response?.data;
    } else {
      console.error(`Error getCarriersTripsDetails: `);
      return null;
    }
  } catch (error) {
    console.error(`Error getCarriersTripsDetails: `, error);
    return null;
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
    if (response?.success) return true;
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
  otherRequirementsAttachments: {
    otId: number;
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
  otherRequirementsAttachments,
  commentary,
  files
}: IPostAddMTTRipTracking) => {
  const formData = new FormData();

  const request = {
    documentsMTs,
    otherRequirementsAttachments,
    commentary
  };

  formData.append("request", JSON.stringify(request));

  // for each file in files, append it to formData
  files.forEach((file) => {
    formData.append(file.name, file.file);
  });

  try {
    const response: any = await API.post(
      `/transfer-request/add-mt-trip-tracking/${trId}`,
      formData
    );
    if (response?.data) return true;
  } catch (error) {
    console.log(`Error postAddMTTRipTracking: `, error);
    throw new Error(typeof error === "string" ? error : "An unknown error occurred");
  }
};
