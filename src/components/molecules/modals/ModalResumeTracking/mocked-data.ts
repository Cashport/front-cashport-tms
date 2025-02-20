import { TimelineEvent, VehicleTracking } from "@/types/logistics/tracking/tracking";

// export const timelineData: TimelineEvent[] = [
//   {
//     id: "1",
//     title: "Solicitud creada",
//     date: "06 Junio, 2023",
//     time: "10:45",
//     responsible: "Juan Perez",
//     estimatedValue: 24000000,
//     downloadUrl: "https://example.com/solicitud_creada.pdf"
//   },
//   {
//     id: "2",
//     title: "TR Confirmada",
//     date: "06 Junio, 2023",
//     time: "23:54",
//     responsible: "Juan Perez",
//     estimatedValue: 25800000
//   },
//   {
//     id: "3",
//     title: "Llegada vehículo",
//     date: "07 Junio, 2023",
//     time: "10:10",
//     responsible: "Juan Perez",
//     downloadUrl: "https://example.com/vehiculo_llegada.jpg"
//   },
//   {
//     id: "4",
//     title: "Novedad km adicionales",
//     date: "07 Junio, 2023",
//     time: "10:10",
//     responsible: "Juan Perez",
//     distanceKm: 80,
//     rate: 25800000,
//     status: "Abierta"
//   },
//   {
//     id: "5",
//     title: "Novedad Stand by",
//     date: "07 Junio, 2023",
//     time: "10:10",
//     responsible: "Juan Perez",
//     hours: 8,
//     rate: 600000,
//     status: "Cerrada"
//   },
//   {
//     id: "6",
//     title: "Cargando",
//     date: "07 Junio, 2023",
//     time: "10:10",
//     driver: "José Rojas"
//   },
//   {
//     id: "7",
//     title: "Viaje iniciado",
//     date: "07 Junio, 2023",
//     time: "10:10",
//     driver: "José Rojas"
//   },
//   {
//     id: "8",
//     title: "Viaje detenido",
//     date: "07 Junio, 2023",
//     time: "10:10"
//   }
// ];

export const vehiclesData: VehicleTracking[] = [
  {
    provider: "Fast Transport Inc.",
    vehicle: "3.5 Ton Truck",
    driver: { name: "Jose Rojas", phone: "3123456789" },
    plate: "ABC-123",
    trackingEvents: [
      {
        id: "1",
        title: "Request Created",
        date: "June 06, 2023",
        time: "10:45",
        responsible: "Juan Perez",
        estimatedValue: 24000000,
        downloadUrl: "https://example.com/request_created.pdf"
      },
      {
        id: "2",
        title: "TR Confirmed",
        date: "June 06, 2023",
        time: "23:54",
        responsible: "Juan Perez",
        estimatedValue: 25800000
      },
      {
        id: "3",
        title: "Vehicle Arrival",
        date: "June 07, 2023",
        time: "10:10",
        responsible: "Juan Perez",
        downloadUrl: "https://example.com/vehicle_arrival.jpg"
      },
      {
        id: "6",
        title: "Loading",
        date: "June 07, 2023",
        time: "10:10",
        driver: "Jose Rojas"
      },
      {
        id: "7",
        title: "Trip Started",
        date: "June 07, 2023",
        time: "10:10",
        driver: "Jose Rojas"
      }
    ]
  },
  {
    provider: "Express Logistics Ltd.",
    vehicle: "2 Ton Van",
    driver: { name: "Juan Perez", phone: "3159876543" },
    plate: "XYZ-789",
    trackingEvents: [
      {
        id: "4",
        title: "Additional KM Incident",
        date: "June 07, 2023",
        time: "10:10",
        responsible: "Juan Perez",
        distanceKm: 80,
        rate: 25800000,
        status: "Abierta"
      },
      {
        id: "5",
        title: "Standby Incident",
        date: "June 07, 2023",
        time: "10:10",
        responsible: "Juan Perez",
        hours: 8,
        rate: 600000,
        status: "Cerrada"
      },
      {
        id: "8",
        title: "Trip Stopped",
        date: "June 07, 2023",
        time: "10:10"
      }
    ]
  }
];
