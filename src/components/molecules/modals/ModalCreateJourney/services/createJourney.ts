import { API, getIdToken } from "@/utils/api/api";
import axios, { AxiosResponse } from "axios";
import config from "@/config";
import { Journey, JourneyFormValues } from "../utils/types";
import { createData } from "../utils/createData";
import { Dispatch, SetStateAction } from "react";

export const createJourney = async (
  data: JourneyFormValues,
  trId: number,
  setIsLoadingSubmit: Dispatch<SetStateAction<boolean>>
): Promise<Journey> => {
  try {
    setIsLoadingSubmit(true);
    const token = await getIdToken();
    const body = createData({ data, idTransferRequest: trId });
    const response = await axios.post(`${config.API_HOST}/journey/create`, body, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token}`
      }
    });
    return response?.data?.data;
  } catch (error) {
    console.log("Error post transfer-order/: ", error);
    throw error as any;
  } finally {
    setIsLoadingSubmit(false);
  }
};

export const updateJourney = async (
  data: JourneyFormValues,
  trId: number,
  setIsLoadingSubmit: Dispatch<SetStateAction<boolean>>
): Promise<Journey> => {
  try {
    setIsLoadingSubmit(true);

    const token = await getIdToken();
    const body = createData({ data, idTransferRequest: trId });
    const response = await axios.put(`${config.API_HOST}/journey/update`, body, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token}`
      }
    });
    return response?.data?.data;
  } catch (error) {
    console.log("Error post transfer-order/: ", error);
    throw error as any;
  } finally {
    setIsLoadingSubmit(false);
  }
};

export const deleteJourney = async (
  idJourney: number,
  idTransferRequest: number,
  setIsLoadingSubmit: Dispatch<SetStateAction<boolean>>
): Promise<any> => {
  try {
    setIsLoadingSubmit(true);
    const customConfig = {
      data: { id: idJourney, idTransferRequest }
    };
    const response = await API.delete(`${config.API_HOST}/journey/delete`, customConfig);
    return response?.data?.data;
  } catch (error) {
    console.log("Error post transfer-order/: ", error);
    throw error as any;
  } finally {
    setIsLoadingSubmit(false);
  }
};
