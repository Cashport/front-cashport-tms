"use client";
import { useState } from "react";
import { Flex, Spin } from "antd";

import UiSearchInput from "@/components/ui/search-input";
import Container from "@/components/atoms/Container/Container";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import TaskTable from "../TaskManagerTable";
import FiltersTasks, {
  ISelectFilterTasks
} from "@/components/atoms/Filters/FiltersTasks/FiltersTasks";

import { ITask } from "@/types/tasks/ITasks";

// Data mock temporal
const mockData: ITask[] = [
  {
    autoId: 101,
    id: "AP-2024-001",
    numeroFactura: "AP-2024-001",
    tr: 19480,
    to: 34520,
    trayecto: "BASE VILLAVICENCIO - CHICHIMENE-67",
    origen: "BASE VILLAVICENCIO",
    destino: "CHICHIMENE-67",
    fechaFactura: "2024-01-15",
    fechaEntrega: "2024-01-20 14:30",
    direccion: "Calle 123 #45-67",
    ciudad: "Chichimene",
    observacion: "Requiere aprobación de gerencia",
    comprador: "NG BUSINESS GROUP",
    proveedores: ["NG BUSINESS GROUP"],
    vendedor: "Cliente ABC",
    fechaVencimiento: "2024-02-15",
    cantidad: 150,
    monto: 2850000,
    factura: [],
    productos: [
      {
        idProducto: "CARGA-001",
        nombreProducto: "Carga general",
        cantidad: 150,
        precioUnitario: 19000,
        iva: 0,
        precioTotal: 2850000,
      },
    ],
    alertas: [],
    estado: "Aprobada",
    fechaProcesamiento: "2024-01-15",
    archivoOriginal: "aprobacion-001.pdf",
    pdfUrl: "http://example.com/pdf/AP-2024-001.pdf",
    status: { id: "1", name: "Aprobada", color: "#52c41a", backgroundColor: "#f6ffed" },
  },
  {
    autoId: 102,
    id: "AP-2024-002",
    numeroFactura: "AP-2024-002",
    tr: 19477,
    to: 34518,
    trayecto: "PALERMO BARRANQUILLA - BASE BARRANCABERMEJA",
    origen: "PALERMO BARRANQUILLA",
    destino: "BASE BARRANCABERMEJA",
    fechaFactura: "2024-01-14",
    fechaEntrega: "2024-01-19 10:00",
    direccion: "Carrera 45 #12-34",
    ciudad: "Barrancabermeja",
    observacion: "Aprobado por coordinador",
    comprador: "NG BUSINESS GROUP",
    proveedores: ["NG BUSINESS GROUP", "TRANSPORTES RÁPIDOS S.A."],
    vendedor: "Cliente XYZ",
    fechaVencimiento: "2024-02-14",
    cantidad: 75,
    monto: 1875000,
    factura: [],
    productos: [
      {
        idProducto: "CARGA-002",
        nombreProducto: "Carga refrigerada",
        cantidad: 75,
        precioUnitario: 25000,
        iva: 0,
        precioTotal: 1875000,
      },
    ],
    alertas: [],
    estado: "Aprobada",
    fechaProcesamiento: "2024-01-14",
    archivoOriginal: "aprobacion-002.pdf",
    pdfUrl: "http://example.com/pdf/AP-2024-002.pdf",
    status: { id: "2", name: "Aprobada", color: "#52c41a", backgroundColor: "#f6ffed" },
  },
  {
    autoId: 103,
    id: "AP-2024-003",
    numeroFactura: "AP-2024-003",
    tr: 19476,
    to: 34517,
    trayecto: "CARTAGENA - PALERMO BARRANQUILLA",
    origen: "CARTAGENA",
    destino: "PALERMO BARRANQUILLA",
    fechaFactura: "2024-01-13",
    fechaEntrega: "2024-01-18 16:00",
    direccion: "Avenida 68 #89-12",
    ciudad: "Barranquilla",
    observacion: "Rechazado por falta de documentación",
    comprador: "PROYECARGA SAS",
    proveedores: ["PROYECARGA SAS"],
    vendedor: "Cliente DEF",
    fechaVencimiento: "2024-02-13",
    cantidad: 200,
    monto: 4200000,
    factura: [],
    productos: [
      {
        idProducto: "CARGA-003",
        nombreProducto: "Carga pesada",
        cantidad: 200,
        precioUnitario: 21000,
        iva: 0,
        precioTotal: 4200000,
      },
    ],
    alertas: ["Documentación incompleta"],
    estado: "Rechazada",
    fechaProcesamiento: "2024-01-13",
    archivoOriginal: "aprobacion-003.pdf",
    pdfUrl: "http://example.com/pdf/AP-2024-003.pdf",
    status: { id: "3", name: "Rechazada", color: "#ff4d4f", backgroundColor: "#fff2f0" },
  },
  {
    autoId: 104,
    id: "AP-2024-004",
    numeroFactura: "AP-2024-004",
    tr: 19475,
    to: 34519,
    trayecto: "ACACIAS - VILLAVICENCIO",
    origen: "ACACIAS",
    destino: "VILLAVICENCIO",
    fechaFactura: "2024-01-12",
    fechaEntrega: "2024-01-17 09:30",
    direccion: "Calle 50 #23-45",
    ciudad: "Villavicencio",
    observacion: "Esperando aprobación final",
    comprador: "TRANSPORTES FLORES DEL LLANO",
    proveedores: ["TRANSPORTES FLORES DEL LLANO", "CARGA SEGURA LTDA"],
    vendedor: "Cliente GHI",
    fechaVencimiento: "2024-02-12",
    cantidad: 85,
    monto: 3400000,
    factura: [],
    productos: [
      {
        idProducto: "CARGA-004",
        nombreProducto: "Carga de alto valor",
        cantidad: 85,
        precioUnitario: 40000,
        iva: 0,
        precioTotal: 3400000,
      },
    ],
    alertas: ["Requiere aprobación urgente"],
    estado: "Aprobada",
    fechaProcesamiento: "2024-01-12",
    archivoOriginal: "aprobacion-004.pdf",
    pdfUrl: "http://example.com/pdf/AP-2024-004.pdf",
    status: { id: "4", name: "Aprobada", color: "#52c41a", backgroundColor: "#f6ffed" },
  },
];



const TaskManagerView = () => {
  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState<ITask[] | undefined>(undefined);
  const [selectedFilters, setSelectedFilters] = useState<ISelectFilterTasks>({
    statuses: [],
    taskTypes: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const filteredData = mockData.filter(task =>
    task.comprador.toLowerCase().includes(search.toLowerCase()) ||
    task.trayecto.toLowerCase().includes(search.toLowerCase()) ||
    task.origen.toLowerCase().includes(search.toLowerCase()) ||
    task.destino.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ overflowY: "auto" }}>
      <Container>
        <Flex gap="1rem" vertical>
          <Flex gap="0.5rem">
            <UiSearchInput
              className="search"
              placeholder="Buscar tarea"
              onChange={(event) => setSearch(event.target.value)}
            />
            <FiltersTasks setSelectedFilters={setSelectedFilters} />
            <GenerateActionButton
              onClick={() => {}}
              disabled={!selectedRows || selectedRows.length === 0}
            />
          </Flex>

          {isLoading ? (
            <Flex justify="center" align="center" style={{ height: "3rem" }}>
              <Spin />
            </Flex>
          ) : (
            <TaskTable
              data={filteredData}
              setSelectedRows={setSelectedRows}
            />
          )}
        </Flex>
      </Container>
    </div>
  );
};

export default TaskManagerView;
