import { Dayjs } from "dayjs";
import {
  IAddTransferOrder,
  IAddTransferOrderContact,
  IAddTransferOrderCostCenter,
  IAddTransferOrderDocument,
  IAddTransferOrderMaterial,
  IAddTransferOrderOtherRequirements,
  IAddTransferOrderPerson,
  IAddTransferOrderProduct,
  IAddTransferOrderVehicle
} from "@/types/logistics/schema";
import { IFormCreateOrder } from "./CreateOrderVieww";

// Función para mapear IFormCreateOrder a ITransferOrder
export const mapFormToTransferOrder = (formData: IFormCreateOrder): IAddTransferOrder => {
  // Obtener fechas y horas del origen y destino
  const originTrip = formData.TripDetails[0];
  const destinationTrip = formData.TripDetails[formData.TripDetails.length - 1];

  // Formatear fechas con dayjs
  const formatDateTime = (date?: Dayjs, time?: Dayjs): string => {
    if (!date || !time) return "";
    const combined = date.hour(time.hour()).minute(time.minute()).second(0);
    return combined.format("YYYY-MM-DD HH:mm:ss");
  };

  // Mapear contactos desde additionalInfo
  const contacts: IAddTransferOrderContact[] = [];

  // Mapear centros de costo desde productServiceLine
  const costCenters: IAddTransferOrderCostCenter[] = [];
  formData.productServiceLine?.productServiceLine?.forEach((psl) => {
    if (psl.selectedPSL && psl.costCenters) {
      psl.costCenters.forEach((cc) => {
        if (cc.selectedCostCenter) {
          costCenters.push({
            id_psl: psl?.selectedPSL?.id.toString() || "",
            id_costcenter: cc.selectedCostCenter.id.toString(),
            percentage: (cc.percentage || 0).toString()
          });
        }
      });
    }
  });

  // Mapear materiales
  const materials: IAddTransferOrderMaterial[] = (formData.material || []).map((mat) => ({
    id_material: mat.id?.toString() || "",
    quantity: mat.quantity.toString()
  }));

  // Mapear otros requerimientos
  const otherRequirements: IAddTransferOrderOtherRequirements[] = (
    formData.otherServices || []
  ).map((service) => ({
    id_other_requeriments: service.id?.toString() || "",
    quantity: service.quantity.toString()
  }));

  // Mapear personas
  const persons: IAddTransferOrderPerson[] = (formData.people || []).map((person) => ({
    id_user: person.id?.toString() || "",
    id_user_line: person.id_psl?.toString() || ""
  }));

  // Mapear vehículos
  const vehicles: IAddTransferOrderVehicle[] = (formData.suggestedVehicle || []).map((vehicle) => ({
    id_vehicle_type: vehicle.id?.toString() || "",
    quantity: vehicle.quantity.toString()
  }));

  // TODO: Mapear productos - Necesitas definir de dónde vienen los productos en IFormCreateOrder
  const products: IAddTransferOrderProduct[] = [];

  // TODO: Definir documentos - probablemente vengan de otra fuente
  const documents: IAddTransferOrderDocument[] = [];

  // Convertir geometry a string
  console.log("Geometry data:", formData.geometry);

  return {
    id_user: "1",
    id_start_location: originTrip.placeId?.toString() || "",
    id_end_location: destinationTrip.placeId?.toString() || "",
    start_date: formatDateTime(originTrip.date, originTrip.time),
    end_date: formatDateTime(destinationTrip.date, destinationTrip.time),
    start_freight_equipment: originTrip.requiresRaising ? "1" : "0",
    end_freight_equipment: destinationTrip.requiresRaising ? "1" : "0",
    freight_origin_time: originTrip.raisingNum || 0,
    freight_destination_time: destinationTrip.raisingNum || 0,
    rotation: "", // TODO: Definir de dónde viene
    start_date_flexible: "1", // TODO: Definir lógica
    end_date_flexible: "1", // TODO: Definir lógica
    id_company: formData.billing?.companyCode?.id.toString() || "0",
    isFixedRate: formData.typeActive === "4" ? 1 : 0, // 4 es renta fija
    transfer_order_contacts: contacts,
    transfer_order_cost_center: costCenters,
    transfer_order_documents: documents,
    transfer_order_material: materials,
    transfer_order_other_requeriments: otherRequirements,
    transfer_order_persons: persons,
    transfer_order_products: products,
    transfer_order_vehicles: vehicles,
    geometry: formData.geometry,
    id_service_type: formData.typeActive,
    id_client: 0,
    observation: formData.additionalInfo?.instructions || "",
    service_type_desc: "",
    client_desc: "",
    contractNumber: "",
    declaredCargoValue: 0,
    files: []
  };
};
