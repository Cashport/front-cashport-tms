import { VehicleRate } from "./VehiclesRatesTable";

export const mockedVehicleRates: VehicleRate[] = [
  {
    vehicleRateId: 1,
    sapDescription: "Standard rate for freight trucks",
    provider: "Logistics Co.",
    vehicle: "Freight Truck",
    rateType: "Fixed",
    from: "2024-01-01",
    to: "2024-12-31",
    value: 500,
    originLocation: "New York, NY"
  },
  {
    vehicleRateId: 2,
    sapDescription: "Weekend surcharge for delivery vans",
    provider: "Express Delivery Inc.",
    vehicle: "Delivery Van",
    rateType: "Surcharge",
    from: "2024-01-01",
    to: "2024-12-31",
    value: 75,
    originLocation: "Los Angeles, CA"
  },
  {
    vehicleRateId: 3,
    sapDescription: "Long-distance rate for cargo trailers",
    provider: "Heavy Transport Ltd.",
    vehicle: "Cargo Trailer",
    rateType: "Per Mile",
    from: "2024-06-01",
    to: "2024-08-31",
    value: 1.25,
    originLocation: "Chicago, IL"
  },
  {
    vehicleRateId: 4,
    sapDescription: "Express service for refrigerated trucks",
    provider: "Cool Transport LLC",
    vehicle: "Refrigerated Truck",
    rateType: "Express",
    from: "2024-01-01",
    to: "2024-12-31",
    value: 800,
    originLocation: "Miami, FL"
  },
  {
    vehicleRateId: 5,
    sapDescription: "Discounted rate for eco-friendly vans",
    provider: "Green Movers",
    vehicle: "Electric Van",
    rateType: "Discount",
    from: "2024-01-01",
    to: "2024-06-30",
    value: 450,
    originLocation: "San Francisco, CA"
  }
];
