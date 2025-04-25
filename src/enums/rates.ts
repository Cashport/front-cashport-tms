export enum RateType {
  KM = "KM",
  OTROS = "OTROS",
  HORAS = "HORAS",
  NOVEDAD = "NOVEDAD",
  TRAYECTOS = "TRAYECTOS",
  MESES = "MESES",
  DIAS = "DIAS",
  SEMANAS = "SEMANAS"
}

export enum SERVICE_TYPES {
  CARGA = "CARGA",
  IZAJE = "IZAJE",
  PERSONAL = "PERSONAL",
  AEREO = "AEREO"
}

export const typeOfTripIds: Record<SERVICE_TYPES, number> = {
  [SERVICE_TYPES.CARGA]: 1,
  [SERVICE_TYPES.IZAJE]: 2,
  [SERVICE_TYPES.PERSONAL]: 3,
  [SERVICE_TYPES.AEREO]: 4
};

export const RateTypeLabels: Record<RateType, string> = {
  [RateType.KM]: "Kilómetros",
  [RateType.OTROS]: "Otros servicios",
  [RateType.HORAS]: "Horas",
  [RateType.NOVEDAD]: "Novedad",
  [RateType.TRAYECTOS]: "Trayectos",
  [RateType.MESES]: "Meses",
  [RateType.DIAS]: "Días",
  [RateType.SEMANAS]: "Semanas"
};

export const RateTypeIds: Record<RateType, number> = {
  [RateType.HORAS]: 1,
  [RateType.KM]: 2,
  [RateType.TRAYECTOS]: 3,
  [RateType.OTROS]: 4,
  [RateType.NOVEDAD]: 5,
  [RateType.MESES]: 6,
  [RateType.DIAS]: 7,
  [RateType.SEMANAS]: 8
};

export const ServiceTypeLabels: Record<SERVICE_TYPES, string> = {
  [SERVICE_TYPES.IZAJE]: "Izaje",
  [SERVICE_TYPES.CARGA]: "Carga",
  [SERVICE_TYPES.PERSONAL]: "Personal",
  [SERVICE_TYPES.AEREO]: "Aéreo"
};

export const ServiceTypeIds: Record<string, number> = {
  [SERVICE_TYPES.CARGA]: 1,
  [SERVICE_TYPES.IZAJE]: 2,
  [SERVICE_TYPES.PERSONAL]: 3,
  [SERVICE_TYPES.AEREO]: 4
};
