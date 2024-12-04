import { PSL } from "@/components/organisms/logistics/orders/DetailsOrderView/components/Responsibles/Responsibles";

export const mockedPSL: PSL[] = [
  {
    id: 1,
    description: "PSL Transporte Nacional",
    transfer_order_cost_center: [
      {
        id: 101,
        percentage: 50,
        cost_center_desc: "Logística Central"
      },
      {
        id: 102,
        percentage: 30,
        cost_center_desc: "Distribución Regional"
      },
      {
        id: 103,
        percentage: 20,
        cost_center_desc: "Almacenamiento Secundario"
      }
    ]
  },
  {
    id: 2,
    description: "PSL Transporte Internacional",
    transfer_order_cost_center: [
      {
        id: 201,
        percentage: 60,
        cost_center_desc: "Operaciones Transfronterizas"
      },
      {
        id: 202,
        percentage: 40,
        cost_center_desc: "Aduanas y Regulaciones"
      }
    ]
  },
  {
    id: 3,
    description: "PSL Transporte Especializado",
    transfer_order_cost_center: [
      {
        id: 301,
        percentage: 70,
        cost_center_desc: "Materiales Peligrosos"
      },
      {
        id: 302,
        percentage: 30,
        cost_center_desc: "Carga Sobredimensionada"
      }
    ]
  }
];
