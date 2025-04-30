import { API } from "@/utils/api/api";
import { RateType, RateTypeIds } from "@/enums/rates";
import { IFormRate } from "@/app/rates/create/page";

interface ICreateRateDTO {
  serviceItemSAP: string;
  serviceDescriptionSAP: string;
  serviceLineDescriptionSAP: string;
  oaSAP: string;
  provider: string;
  contract: string;
  serviceType: number;
  vehicleType: string;
  rateType: RateType;
  from: string;
  to: string;
  rateDetail: string;
  otherServices?: string;
  amount: number;
}

interface PricingData {
  id_carrier: number;
  id_service_type: number;
  SAP_Item: string;
  SAP_Service: string;
  SAP_description: string;
  SAP_value: number;
  SAP_unit: string;
  OA: string;
  VENDOR: string;
  id_vehicle_type: number;
  price: number;
  pricing_type: number;
  from_units?: number;
  to_units?: number;
}

export const ratesService = {
  async createRate(data: IFormRate) {
    try {
      const pricingData: PricingData = {
        id_carrier: Number(data.provider),
        id_service_type: data.serviceType,
        SAP_Item: data.serviceItemSAP,
        SAP_Service: data.serviceDescriptionSAP,
        SAP_description: data.serviceLineDescriptionSAP,
        SAP_value: Number(data.amount.replaceAll(".", "").replaceAll(",", ".")) || 0,
        SAP_unit: "JOB",
        OA: data.oaSAP,
        VENDOR: data.provider,
        id_vehicle_type: Number(data.vehicleType),
        price: Number(data.amount.replaceAll(".", "").replaceAll(",", ".")) || 0,
        pricing_type: RateTypeIds[data.rateType],
        from_units: data.from ? Number(data.from) : undefined,
        to_units: data.to ? Number(data.to) : undefined
      };

      await API.post("/pricing", pricingData);
      return true;
    } catch (error) {
      console.error("Error al crear la tarifa:", error);
      throw error;
    }
  }
};
