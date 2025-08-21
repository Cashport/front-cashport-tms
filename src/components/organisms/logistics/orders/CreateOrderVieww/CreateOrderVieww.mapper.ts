import dayjs, { Dayjs } from "dayjs";
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
import { auth } from "../../../../../../firebase";

// Función para mapear IFormCreateOrder a ITransferOrder
export const mapFormToTransferOrder = (formData: IFormCreateOrder): IAddTransferOrder => {
  // Obtener fechas y horas del origen y destino
  const originTrip = formData.TripDetails[0];
  const destinationTrip = formData.TripDetails[formData.TripDetails.length - 1];

  // Función para formatear fechas en formato ISO 8601 con timezone
  const formatDateTimeISO = (date?: Dayjs, time?: Dayjs): string => {
    if (!date || !time) return "";

    // Combinar fecha y hora
    const combined = date
      .hour(time.hour())
      .minute(time.minute())
      .second(time.second())
      .millisecond(0);

    // Retornar en formato ISO 8601 con timezone UTC
    return combined.toISOString();
  };

  // Función para calcular endDate basado en duración
  const calculateEndDate = (startDate: string, durationInSeconds?: number): string => {
    if (!startDate || !durationInSeconds) return startDate;

    // Parsear la fecha de inicio usando dayjs
    const start = dayjs(startDate);

    // Agregar la duración en segundos
    const end = start.add(durationInSeconds, "second");

    // Retornar en formato ISO 8601
    return end.toISOString();
  };

  // Formatear fecha de inicio
  const startDate = formatDateTimeISO(originTrip.date, originTrip.time);

  // Calcular fecha de fin
  let endDate = "";
  if (destinationTrip.date && destinationTrip.time) {
    // Si hay fecha y hora de destino, usarlas
    endDate = formatDateTimeISO(destinationTrip.date, destinationTrip.time);
  } else if (startDate && formData.infoMap?.duration) {
    // Si no hay fecha/hora de destino pero sí duración, calcular basado en la duración
    endDate = calculateEndDate(startDate, formData.infoMap.duration);
  } else {
    // Como último recurso, usar la fecha de inicio
    endDate = startDate;
  }

  // Mapear contactos desde additionalInfo.contactsPerLocation
  const contacts: IAddTransferOrderContact[] = [];

  if (formData.additionalInfo?.contactsPerLocation) {
    formData.additionalInfo.contactsPerLocation.forEach((location, locationIndex) => {
      // Determinar el tipo de contacto basado en el índice
      // Primer location = origen (type "1"), último = destino (type "2")
      let contactType = "1"; // Por defecto origen
      const contactsLength = formData?.additionalInfo?.contactsPerLocation?.length ?? 0;
      if (locationIndex === contactsLength - 1) {
        contactType = "2"; // Destino
      } else if (locationIndex > 0) {
        contactType = "3"; // Paradas intermedias (si existe este tipo)
      }

      location.contacts.forEach((contact) => {
        if (contact.contact_name && contact.contact_phone) {
          contacts.push({
            id_contact: "0", // ID por defecto para nuevos contactos
            contact_type: contactType,
            name: contact.contact_name,
            contact_number: contact.contact_phone
          });
        }
      });
    });
  }

  // Mapear centros de costo desde productServiceLine
  const costCenters: IAddTransferOrderCostCenter[] = [];
  formData.productServiceLine?.productServiceLine?.forEach((psl) => {
    if (psl.selectedPSL && psl.costCenters) {
      psl.costCenters.forEach((cc) => {
        if (cc.selectedCostCenter) {
          costCenters.push({
            id_psl: psl.selectedPSL?.id?.toString() || "",
            id_costcenter: cc.selectedCostCenter.id?.toString() || "",
            percentage: (cc.percentage || 0).toString()
          });
        }
      });
    }
  });

  // Mapear materiales
  const materials: IAddTransferOrderMaterial[] = (formData.material || []).map((mat) => ({
    id_material: mat.id?.toString() || "",
    quantity: (mat.quantity || 0).toString(),
    weight: mat.kg_weight || 0,
    height: mat.mt_height || 0,
    width: mat.mt_width || 0,
    length: mat.mt_length || 0,
    is_controlled_substance: mat.restriction ? 1 : 0
  }));

  // Mapear otros requerimientos
  const otherRequirements: IAddTransferOrderOtherRequirements[] = (
    formData.otherServices || []
  ).map((service) => ({
    id_other_requeriments: service.id?.toString() || "",
    quantity: (service.quantity || 0).toString()
  }));

  // Mapear personas
  const persons: IAddTransferOrderPerson[] = (formData.people || []).map((person) => ({
    id_user: person.id?.toString() || "",
    id_user_line: person.id_psl?.toString() || ""
  }));

  // Mapear vehículos
  const vehicles: IAddTransferOrderVehicle[] = (formData.suggestedVehicle || []).map((vehicle) => ({
    id_vehicle_type: vehicle.id?.toString() || "",
    quantity: (vehicle.quantity || 0).toString()
  }));

  // Mapear productos - vacío por ahora ya que no está en IFormCreateOrder
  const products: IAddTransferOrderProduct[] = [];

  // Mapear documentos - vacío por ahora
  const documents: IAddTransferOrderDocument[] = [];

  // Obtener el email del usuario actual
  const currentUserEmail = auth.currentUser?.email || "";

  return {
    id: 0,
    id_user: "1", // ID del usuario como string
    user: currentUserEmail,
    id_start_location: originTrip.placeId?.toString() || "0",
    id_end_location: destinationTrip.placeId?.toString() || "0",
    start_date: startDate,
    end_date: endDate,
    start_freight_equipment: originTrip.requiresRaising ? "1" : "0",
    end_freight_equipment: destinationTrip.requiresRaising ? "1" : "0",
    freight_origin_time: originTrip.raisingNum || 0,
    freight_destination_time: destinationTrip.raisingNum || 0,
    rotation: "0",
    start_date_flexible: "0",
    end_date_flexible: "0",
    id_route: "", // Vacío por defecto
    id_company: formData.billing?.companyCode?.id?.toString() || "1",
    isFixedRate: formData.typeActive === "4" ? "1" : "0",
    status: "",
    active: "true",
    created_at: new Date().toISOString(),
    created_by: currentUserEmail,
    transfer_order_contacts: contacts,
    transfer_order_cost_center: costCenters,
    transfer_order_documents: documents,
    transfer_order_material: materials,
    transfer_order_other_requeriments: otherRequirements,
    transfer_order_persons: persons,
    transfer_order_products: products,
    transfer_order_vehicles: vehicles,
    geometry: formData.geometry || [],
    id_service_type: formData.typeActive || "0",
    id_client: formData.billing?.endClient?.id || 0,
    observation: formData.additionalInfo?.instructions || null,
    service_type_desc: getServiceTypeDescription(formData.typeActive),
    client_desc: "",
    contractNumber: "", // Agregar si existe en el form
    declaredCargoValue: 0, // Agregar si existe en el form
    files: []
  };
};

// Función auxiliar para obtener la descripción del tipo de servicio
const getServiceTypeDescription = (typeActive: string): string => {
  const serviceTypes: Record<string, string> = {
    "1": "Carga",
    "2": "Pasajeros",
    "3": "Mixto",
    "4": "Renta Fija"
  };
  return serviceTypes[typeActive] || "Carga";
};
