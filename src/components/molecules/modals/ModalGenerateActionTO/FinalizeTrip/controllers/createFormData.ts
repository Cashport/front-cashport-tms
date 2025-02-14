import { FinalizeTripForm } from "./finalizetrip.types";

export function createFormData(form: FinalizeTripForm): FormData {
  const formData = new FormData();
  const documentsMTs: { entityId: number; file: string; entityType: "trip" | "requirement" }[] = [];
  const observations: { carrierId: number; Observation: string }[] = [];

  form.carriers.forEach((carrier) => {
    if (carrier.adittionalComment) {
      observations.push({
        carrierId: carrier.idCarrier,
        Observation: carrier.adittionalComment
      });
    }
    carrier.vehicles.forEach((vehicle, indexCarrier) => {
      vehicle.documents.forEach((document, indexVehicle) => {
        if (document.file) {
          documentsMTs.push({
            entityId: vehicle.tripId,
            file: `INVOICE-${indexCarrier}-${indexVehicle}-trip`,
            entityType: "trip"
          });
          formData.append(`INVOICE-${indexCarrier}-${indexVehicle}-trip`, document.file);
        }
      });
    });
    carrier.requirements.forEach((requirement, indexCarrier) => {
      requirement.documents.forEach((document, indexRequirement) => {
        if (document.file) {
          documentsMTs.push({
            entityId: requirement.requirementId,
            file: `INVOICE-${indexCarrier}-${indexRequirement}-requirement`,
            entityType: "requirement"
          });
          formData.append(`INVOICE-${indexCarrier}-${indexRequirement}-requirement`, document.file);
        }
      });
    });
  });

  formData.append("request", JSON.stringify({ documentsMTs, observations }));
  return formData;
}
