export interface ITaskStatus {
  id: string;
  name: string;
  color: string;
  backgroundColor: string;
}

export interface ITaskTypes {
  ID: number;
  NAME: string;
}

export interface ITask {
  autoId: number;
  id: string;
  tr: number;
  to: number | string;
  trayecto: string;
  origen: string;
  destino: string;
  fechaFactura: string;
  fechaEntrega?: string;
  direccion?: string;
  ciudad?: string;
  observacion?: string;
  comprador: string;
  proveedores?: string[];
  vendedor: string;
  estado: "Pendiente asignación" | "En licitación" | "Proveedor aceptó" | "Proveedor rechazó" | "Pendiente" | "Aprobada" | "Rechazada";
  factura?: string[];
  cantidad: number;
  monto: number;
  numeroFactura: string;
  fechaVencimiento?: string;
  productos: Array<{
    idProducto: string;
    nombreProducto: string;
    cantidad: number;
    precioUnitario: number;
    iva: number;
    precioTotal: number;
  }>;
  alertas: string[];
  fechaProcesamiento: string;
  archivoOriginal: string;
  pdfUrl?: string;
  status: ITaskStatus;
}