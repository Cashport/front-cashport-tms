export interface Option {
  value: number;
  label: string;
}

export const OPTIONS_PROVIDERS: Option[] = [
  { value: 0, label: "Proveedor A" },
  { value: 1, label: "Proveedor B" },
  { value: 2, label: "Proveedor C" },
  { value: 3, label: "Proveedor D" }
];

export const OPTIONS_VEHICLES: Option[] = [
  { value: 0, label: "Camión" },
  { value: 1, label: "Furgoneta" },
  { value: 2, label: "Tráiler" },
  { value: 3, label: "Auto" }
];

export const OPTIONS_UNITS_MEASUREMENT: Option[] = [
  { value: 0, label: "Kilogramos" },
  { value: 1, label: "Toneladas" },
  { value: 2, label: "Litros" },
  { value: 3, label: "Metros cúbicos" }
];

export const OPTIONS_BASE_LOCATION: Option[] = [
  { value: 0, label: "Centro A" },
  { value: 1, label: "Centro B" },
  { value: 2, label: "Centro C" },
  { value: 3, label: "Centro D" }
];

export const OPTIONS_SAP_DESCRIPTION: Option[] = [
  { value: 0, label: "Material A" },
  { value: 1, label: "Material B" },
  { value: 2, label: "Material C" },
  { value: 3, label: "Material D" }
];
