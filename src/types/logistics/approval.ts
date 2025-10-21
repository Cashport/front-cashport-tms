/**
 * Form data structure for New Approval Form
 */

export interface ForecastItem {
  id: string;
  proveedor: string;
  vendor: string;
  contrato: string;
  tipoVehiculo: string;
  descripcionTarifa: string;
  tarifa: number;
  cantidadUsos: number;
  cotizacionUrl: string;
}

export interface ComparisonRate {
  id: string;
  proveedor: string;
  tipo: string;
  tipoVehiculo: string;
  tipoTarifa: string;
  contrato: string;
  tarifa: number;
  diferencia: number;
}

export interface Approver {
  id: string;
  name: string;
  email: string;
}

/**
 * Main form interface for NewApprovalForm component
 * All form fields are consolidated here for React Hook Form
 */
export interface INewApprovalForm {
  // General fields
  tipoAprobacion: string;
  observaciones: string;
  isSingleSource: boolean;

  // Specific Trip / Recurring Rate questions
  validadoCoordinador: string;
  proveedorRecomendado: string;
  emailConfirmacionFile: File | null;

  // Outsourcing (Tercerización) questions
  motivoTercerizacion: string;
  existenProveedoresZona: string;
  proveedorSinDisponibilidad: string;
  aseguroHabilitar: boolean;

  // Complex data
  forecastItems: ForecastItem[];
  approvers: Approver[];
  comparisonRates: Record<string, ComparisonRate[]>;
}

/**
 * Default values for the form
 */
export const defaultApprovalFormValues: INewApprovalForm = {
  // General
  tipoAprobacion: "",
  observaciones: "",
  isSingleSource: false,

  // Specific Trip / Recurring Rate
  validadoCoordinador: "",
  proveedorRecomendado: "",
  emailConfirmacionFile: null,

  // Outsourcing
  motivoTercerizacion: "",
  existenProveedoresZona: "",
  proveedorSinDisponibilidad: "",
  aseguroHabilitar: false,

  // Complex data
  forecastItems: [],
  approvers: [{ id: "1", name: "", email: "" }],
  comparisonRates: {}
};
