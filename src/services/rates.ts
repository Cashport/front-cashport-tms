import { API } from "@/utils/api/api";
import { RateType } from "@/enums/rates";
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
  SAP_value: string;
  SAP_unit: string;
  OA: string;
  VENDOR: string;
  id_vehicle_type: number;
  price: string;
  pricing_type: number;
  from_units?: number;
  to_units?: number;
  id_location_from: string;
  id_location_to: string;
  approval_comment?: string;
  id_contract: string;
  id_novelty_type?: number;
  unit_type?: string;
  id_unit_type?: number;
}

export const ratesService = {
  async createRate({
    data,
    commentary,
    file
  }: {
    data: IFormRate;
    commentary?: string;
    file?: File;
  }) {
    try {
      const rawAmount = data.amount.replaceAll(".", "");

      const request: Partial<PricingData> = {
        SAP_unit: "JOB"
      };

      if (data.provider) {
        request.id_carrier = Number(data.provider);
        request.VENDOR = data.provider;
      }

      if (data.serviceType) request.id_service_type = data.serviceType;
      if (data.serviceItemSAP) request.SAP_Item = data.serviceItemSAP;
      if (data.serviceDescriptionSAP) request.SAP_Service = data.serviceDescriptionSAP;
      if (data.serviceLineDescriptionSAP) request.SAP_description = data.serviceLineDescriptionSAP;
      if (rawAmount) {
        request.SAP_value = rawAmount;
        request.price = rawAmount;
      }
      if (data.oaSAP) request.OA = data.oaSAP;
      if (data.vehicleType) request.id_vehicle_type = Number(data.vehicleType);
      if (data.rateType) request.pricing_type = data.rateType;
      if (data.from) request.from_units = Number(data.from);
      if (data.to) request.to_units = Number(data.to);
      if (data.origin) request.id_location_from = data.origin;
      if (data.destination) request.id_location_to = data.destination;
      if (commentary) request.approval_comment = commentary;
      if (data.contract) request.id_contract = data.contract;
      if (data.noveltyType) request.id_novelty_type = Number(data.noveltyType);
      if (data.unit_type) request.unit_type = data.unit_type;
      if (data.otherServices) request.id_unit_type = Number(data.id_unit_type);

      const formData = new FormData();
      if (file) formData.append("file", file);
      formData.append("request", JSON.stringify(request));

      await API.post("/pricing", formData);
      return true;
    } catch (error) {
      console.error("Error al crear la tarifa:", error);
      throw error;
    }
  }
};
