import { AxiosResponse } from "axios";
import config from "@/config";
import { API } from "@/utils/api/api";
import {
  ICreateShipTo,
  IGetOneShipTo,
  IUpdateShipTo,
  ShipToFormType
} from "@/types/shipTo/IShipTo";
import { ISelectedBussinessRules } from "@/types/bre/IBRE";
import { MessageInstance } from "antd/es/message/interface";
import { SUCCESS } from "@/utils/constants/globalConstants";
import { IBillingPeriodForm } from "@/types/billingPeriod/IBillingPeriod";

export const addShipTo = async (
  clientID: number,
  projectID: number,
  selectedData: ShipToFormType,
  zones: number[],
  selectedStructure: ISelectedBussinessRules,
  messageApi: MessageInstance
): Promise<any> => {
  const shipToData = selectedData.shipTo;

  const modelData: ICreateShipTo = {
    client_id: clientID.toString(),
    accounting_code: shipToData.code,
    project_id: projectID,
    depency_client: Number(shipToData.dependency_client),
    description: "Burned description",
    zone: zones,
    channel: selectedStructure.channels,
    line: selectedStructure.lines,
    subline: selectedStructure.sublines,
    id_address: shipToData.address_id,
    condition_payment: shipToData.condition_payment ? shipToData.condition_payment.value : 0,
    radication_type: shipToData.radication_type ? shipToData.radication_type?.value : 0
  };

  try {
    const response: AxiosResponse = await API.post(`${config.API_HOST}/ship-to`, modelData);

    if (response.status === SUCCESS) {
      messageApi.open({
        type: "success",
        content: `El Ship To fue creado exitosamente.`
      });
    } else {
      messageApi.open({
        type: "error",
        content: "Oops ocurrio un error creando Ship To."
      });
    }

    return response;
  } catch (error) {
    console.warn("Error creating Ship To: ", error);
    messageApi.open({
      type: "error",
      content: "Oops ocurrio un error creando Ship To."
    });
    return error as any;
  }
};

export const getShipToByCode = async (code: string, projectId: number): Promise<any> => {
  try {
    const response: IGetOneShipTo = await API.get(
      `${config.API_HOST}/ship-to/${code}/project/${projectId}`
    );

    return response.data;
  } catch (error) {
    console.warn("Error getting Ship To: ", error);
    return error as any;
  }
};

// function to update ship to
export const updateShipTo = async (
  clientID: number,
  projectID: number,
  selectedData: ShipToFormType,
  zones: number[],
  selectedStructure: ISelectedBussinessRules,
  billingPeriod: IBillingPeriodForm | undefined,
  messageApi: MessageInstance
): Promise<any> => {
  const shipToData = selectedData.shipTo;

  console.log("entrando a hacer edit");

  const modelData: IUpdateShipTo = {
    client_id: clientID.toString(),
    project_id: projectID,
    depency_client: Number(shipToData.dependency_client),
    description: "Burned description",
    zone: zones,
    channel: selectedStructure.channels,
    line: selectedStructure.lines,
    subline: selectedStructure.sublines,
    contacts: "null",
    address_id: shipToData.address_id,
    condition_payment: shipToData.condition_payment ? shipToData.condition_payment.value : 0,
    radication_type: shipToData.radication_type ? shipToData.radication_type.value : 0,
    day_flag: typeof billingPeriod === "string" ? undefined : billingPeriod?.day_flag === "true",
    day: typeof billingPeriod === "string" ? undefined : billingPeriod?.day,
    order: typeof billingPeriod === "string" ? undefined : billingPeriod?.order?.toLowerCase(),
    day_of_week:
      typeof billingPeriod === "string" ? undefined : billingPeriod?.day_of_week?.toLowerCase()
  };

  try {
    const response: AxiosResponse = await API.put(
      `${config.API_HOST}/ship-to/${shipToData.code}/project/${projectID}`,
      modelData
    );

    if (response.status === SUCCESS) {
      messageApi.open({
        type: "success",
        content: `El Ship To fue actualizado exitosamente.`
      });
    } else {
      messageApi.open({
        type: "error",
        content: "Oops ocurrio un error actualizando Ship To."
      });
    }

    return response;
  } catch (error) {
    console.warn("Error updating Ship To: ", error);
    return error as any;
  }
};

export const deleteShipToByCode = async (
  code: string,
  projectId: number,
  messageApi: MessageInstance
): Promise<any> => {
  try {
    const response: AxiosResponse = await API.delete(
      `${config.API_HOST}/ship-to/${code}/project/${projectId}`
    );

    if (response.status === SUCCESS) {
      messageApi.open({
        type: "success",
        content: `El Ship To fue eliminado exitosamente.`
      });
    } else {
      messageApi.open({
        type: "error",
        content: "Oops ocurrio un error eliminando Ship To."
      });
    }
    return response;
  } catch (error) {
    console.warn("Error deleting Ship To: ", error);
    messageApi.open({
      type: "error",
      content: "Oops ocurrio un error eliminando Ship To."
    });
    return error as any;
  }
};
