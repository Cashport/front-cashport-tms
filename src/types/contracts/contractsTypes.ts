export interface VehicleRate {
  id: number;
  sapId: number;
  supplier: string;
  sapDescription: string;
  vehicle: string;
  unitOfMeasurement: string;
  from: string;
  to: string;
  value: number;
  difference: number;
  baseCity: string;
  sapPrice: string;
  realPrice: number;
}

export interface IVehicleRates {
  status: number;
  message: string;
  data: VehicleRate[];
}
