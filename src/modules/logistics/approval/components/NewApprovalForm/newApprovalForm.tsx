"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store/store";

import { ArrowLeft, FileText, Download, X, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Label } from "@/modules/chat/ui/label";
import { Card, CardContent } from "@/modules/chat/ui/card";
import { Textarea } from "@/modules/chat/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/modules/chat/ui/radio-group";
import { Input } from "@/modules/chat/ui/input";
import { Button } from "@/modules/chat/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/modules/chat/ui/select";
import { Checkbox } from "@/modules/chat/ui/checkbox";

import "@/modules/chat/styles/chatStyles.css";

interface NewApprovalFormProps {
  onBack?: () => void;
}

interface ForecastItem {
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

interface ComparisonRate {
  id: string;
  proveedor: string;
  tipo: string;
  tipoVehiculo: string;
  tipoTarifa: string;
  contrato: string;
  tarifa: number;
  diferencia: number;
}

interface Approver {
  id: string;
  name: string;
  email: string;
}

export function NewApprovalForm({ onBack }: NewApprovalFormProps) {
  // Zustand store - Carrier for Approval slice
  const selectedCarrier = useAppStore((state) => state.selectedCarrier);
  const transferRequestId = useAppStore((state) => state.transferRequestId);

  const [tipoAprobacion, setTipoAprobacion] = useState<string>("");
  const [validadoCoordinador, setValidadoCoordinador] = useState<string>("");
  const [proveedorRecomendado, setProveedorRecomendado] = useState<string>("");
  const [emailConfirmacionFile, setEmailConfirmacionFile] = useState<File | null>(null);

  const [existenProveedoresZona, setExistenProveedoresZona] = useState<string>("");
  const [motivoTercerizacion, setMotivoTercerizacion] = useState<string>("");
  const [proveedorSinDisponibilidad, setProveedorSinDisponibilidad] = useState<string>("");
  const [aseguroHabilitar, setAseguroHabilitar] = useState<boolean>(false);

  const [isSingleSource, setIsSingleSource] = useState<boolean>(false);
  const [observaciones, setObservaciones] = useState<string>("");

  const [approvers, setApprovers] = useState<Approver[]>([{ id: "1", name: "", email: "" }]);

  const [forecastItems, setForecastItems] = useState<ForecastItem[]>([
    {
      id: "1",
      proveedor: "COLTANQUES",
      vendor: "121313551",
      contrato: "12135158 CAMABAJA",
      tipoVehiculo: "0 - 100 KM",
      descripcionTarifa: "0 - 100 KM",
      tarifa: 1500000,
      cantidadUsos: 0,
      cotizacionUrl: "/cotizaciones/coltanques-1.pdf"
    },
    {
      id: "2",
      proveedor: "COLTANQUES",
      vendor: "121313551",
      contrato: "12135158 CAMABAJA",
      tipoVehiculo: "0 - 100 KM",
      descripcionTarifa: "0 - 100 KM",
      tarifa: 1500000,
      cantidadUsos: 0,
      cotizacionUrl: "/cotizaciones/coltanques-2.pdf"
    },
    {
      id: "3",
      proveedor: "COLTANQUES",
      vendor: "121313551",
      contrato: "12135158 CAMABAJA",
      tipoVehiculo: "0 - 100 KM",
      descripcionTarifa: "0 - 100 KM",
      tarifa: 1500000,
      cantidadUsos: 0,
      cotizacionUrl: "/cotizaciones/coltanques-3.pdf"
    }
  ]);

  const [comparisonRates, setComparisonRates] = useState<Record<string, ComparisonRate[]>>({});
  const [expandedAnalysis, setExpandedAnalysis] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (tipoAprobacion === "viaje-especifico" || tipoAprobacion === "tercerizacion") {
      setForecastItems(forecastItems.map((item) => ({ ...item, cantidadUsos: 1 })));
    }
  }, [tipoAprobacion]);

  // Log carrier for approval slice values to console
  useEffect(() => {
    console.log("=== Carrier For Approval Slice ===");
    console.log("Selected Carrier:", selectedCarrier);
    console.log("Transfer Request ID:", transferRequestId);
  }, [selectedCarrier, transferRequestId]);

  const updateCantidadUsos = (id: string, value: string) => {
    if (tipoAprobacion === "viaje-especifico" || tipoAprobacion === "tercerizacion") {
      return;
    }
    const cantidad = Number.parseInt(value) || 0;
    setForecastItems(
      forecastItems.map((item) => (item.id === id ? { ...item, cantidadUsos: cantidad } : item))
    );
  };

  const handleEmailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEmailConfirmacionFile(e.target.files[0]);
    }
  };

  const calculateTotal = (tarifa: number, cantidad: number) => {
    return tarifa * cantidad;
  };

  const calculateGrandTotal = () => {
    return forecastItems.reduce((sum, item) => {
      return sum + calculateTotal(item.tarifa, item.cantidadUsos);
    }, 0);
  };

  const addComparisonRate = (forecastItemId: string) => {
    const newRate: ComparisonRate = {
      id: `comp-${Date.now()}`,
      proveedor: "",
      tipo: "",
      tipoVehiculo: "",
      tipoTarifa: "",
      contrato: "",
      tarifa: 0,
      diferencia: 0
    };

    setComparisonRates({
      ...comparisonRates,
      [forecastItemId]: [...(comparisonRates[forecastItemId] || []), newRate]
    });
  };

  const removeComparisonRate = (forecastItemId: string, rateId: string) => {
    setComparisonRates({
      ...comparisonRates,
      [forecastItemId]: (comparisonRates[forecastItemId] || []).filter((rate) => rate.id !== rateId)
    });
  };

  const updateComparisonRate = (
    forecastItemId: string,
    rateId: string,
    field: keyof ComparisonRate,
    value: any
  ) => {
    setComparisonRates({
      ...comparisonRates,
      [forecastItemId]: (comparisonRates[forecastItemId] || []).map((rate) =>
        rate.id === rateId ? { ...rate, [field]: value } : rate
      )
    });
  };

  const toggleAnalysis = (forecastItemId: string) => {
    setExpandedAnalysis({
      ...expandedAnalysis,
      [forecastItemId]: !expandedAnalysis[forecastItemId]
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting new approval:", {
      tipoAprobacion,
      validadoCoordinador,
      proveedorRecomendado,
      existenProveedoresZona,
      motivoTercerizacion,
      proveedorSinDisponibilidad,
      aseguroHabilitar,
      emailConfirmacionFile,
      forecastItems,
      comparisonRates,
      isSingleSource,
      observaciones,
      approvers,
      total: calculateGrandTotal()
    });
  };

  const renderValidationQuestions = () => {
    switch (tipoAprobacion) {
      case "viaje-especifico":
        return (
          <>
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Valido previamente con el coordinador de la zona que no haya un contrato activo para
                este scope?
              </Label>
              <RadioGroup
                value={validadoCoordinador}
                onValueChange={setValidadoCoordinador}
                required
              >
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="validado-si" className="border-2" />
                    <Label
                      htmlFor="validado-si"
                      className="font-normal cursor-pointer text-gray-700"
                    >
                      Sí
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="validado-no" className="border-2" />
                    <Label
                      htmlFor="validado-no"
                      className="font-normal cursor-pointer text-gray-700"
                    >
                      No
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                ¿Este proveedor es recomendado por el departamento de sostenibilidad?
              </Label>
              <RadioGroup
                value={proveedorRecomendado}
                onValueChange={setProveedorRecomendado}
                required
              >
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="recomendado-si" className="border-2" />
                    <Label
                      htmlFor="recomendado-si"
                      className="font-normal cursor-pointer text-gray-700"
                    >
                      Sí
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="recomendado-no" className="border-2" />
                    <Label
                      htmlFor="recomendado-no"
                      className="font-normal cursor-pointer text-gray-700"
                    >
                      No
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              {proveedorRecomendado === "si" && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Label
                    htmlFor="emailConfirmacion"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Adjuntar correo de confirmación
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="emailConfirmacion"
                      type="file"
                      accept=".pdf,.eml,.msg"
                      onChange={handleEmailFileChange}
                      className="flex-1 border-2 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {emailConfirmacionFile && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEmailConfirmacionFile(null)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {emailConfirmacionFile && (
                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {emailConfirmacionFile.name}
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        );

      case "tarifa-recurrente":
        return (
          <>
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Valido previamente con el coordinador de la zona que no haya un contrato activo para
                este scope?
              </Label>
              <RadioGroup
                value={validadoCoordinador}
                onValueChange={setValidadoCoordinador}
                required
              >
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="validado-si-recurrente" className="border-2" />
                    <Label
                      htmlFor="validado-si-recurrente"
                      className="font-normal cursor-pointer text-gray-700"
                    >
                      Sí
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="validado-no-recurrente" className="border-2" />
                    <Label
                      htmlFor="validado-no-recurrente"
                      className="font-normal cursor-pointer text-gray-700"
                    >
                      No
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                ¿Este proveedor es recomendado por el departamento de sostenibilidad?
              </Label>
              <RadioGroup
                value={proveedorRecomendado}
                onValueChange={setProveedorRecomendado}
                required
              >
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="si"
                      id="recomendado-si-recurrente"
                      className="border-2"
                    />
                    <Label
                      htmlFor="recomendado-si-recurrente"
                      className="font-normal cursor-pointer text-gray-700"
                    >
                      Sí
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="no"
                      id="recomendado-no-recurrente"
                      className="border-2"
                    />
                    <Label
                      htmlFor="recomendado-no-recurrente"
                      className="font-normal cursor-pointer text-gray-700"
                    >
                      No
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              {proveedorRecomendado === "si" && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Label
                    htmlFor="emailConfirmacion"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Adjuntar correo de confirmación
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="emailConfirmacion"
                      type="file"
                      accept=".pdf,.eml,.msg"
                      onChange={handleEmailFileChange}
                      className="flex-1 border-2 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {emailConfirmacionFile && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEmailConfirmacionFile(null)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {emailConfirmacionFile && (
                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {emailConfirmacionFile.name}
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        );

      case "tercerizacion":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="motivoTercerizacion" className="text-sm font-medium text-gray-700">
                Motivo por el cual esta tercerizando
              </Label>
              <Select value={motivoTercerizacion} onValueChange={setMotivoTercerizacion} required>
                <SelectTrigger
                  id="motivoTercerizacion"
                  className="border-2 focus:ring-2 focus:ring-blue-500"
                >
                  <SelectValue placeholder="Seleccionar motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-proveedores">No tenemos proveedores en la zona</SelectItem>
                  <SelectItem value="lineamiento-social">Lineamiento Social</SelectItem>
                  <SelectItem value="falta-disponibilidad">
                    Falta de disponibilidad con proveedor
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Existen proveedores en la zona para prestar el servicio
              </Label>
              <RadioGroup
                value={existenProveedoresZona}
                onValueChange={setExistenProveedoresZona}
                required
              >
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="proveedores-zona-si" className="border-2" />
                    <Label
                      htmlFor="proveedores-zona-si"
                      className="font-normal cursor-pointer text-gray-700"
                    >
                      Sí
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="proveedores-zona-no" className="border-2" />
                    <Label
                      htmlFor="proveedores-zona-no"
                      className="font-normal cursor-pointer text-gray-700"
                    >
                      No
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {existenProveedoresZona === "si" && (
              <div className="space-y-2">
                <Label
                  htmlFor="proveedorSinDisponibilidad"
                  className="text-sm font-medium text-gray-700"
                >
                  Proveedor local que no presento disponibilidad
                </Label>
                <Select
                  value={proveedorSinDisponibilidad}
                  onValueChange={setProveedorSinDisponibilidad}
                  required
                >
                  <SelectTrigger
                    id="proveedorSinDisponibilidad"
                    className="border-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coltanques">COLTANQUES</SelectItem>
                    <SelectItem value="ng-transportes">NG TRANSPORTES</SelectItem>
                    <SelectItem value="entrapetrol">ENTRAPETROL</SelectItem>
                    <SelectItem value="transporte-express">TRANSPORTE EXPRESS</SelectItem>
                    <SelectItem value="logistica-del-norte">LOGÍSTICA DEL NORTE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-start space-x-3 p-4 bg-purple-600 rounded-lg shadow-sm">
              <Checkbox
                id="aseguroHabilitar"
                checked={aseguroHabilitar}
                onCheckedChange={(checked) => setAseguroHabilitar(checked as boolean)}
                required
                className="mt-0.5 border-2 border-white data-[state=checked]:bg-white data-[state=checked]:text-purple-600"
              />
              <Label
                htmlFor="aseguroHabilitar"
                className="text-sm text-white font-normal cursor-pointer leading-relaxed"
              >
                Aseguro habilitar como subcontratista ante Halliburton a la empresa utilizada.
              </Label>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const addApprover = () => {
    const newApprover: Approver = {
      id: Date.now().toString(),
      name: "",
      email: ""
    };
    setApprovers([...approvers, newApprover]);
  };

  const removeApprover = (id: string) => {
    if (approvers.length > 1) {
      setApprovers(approvers.filter((approver) => approver.id !== id));
    }
  };

  const updateApprover = (id: string, field: keyof Approver, value: string) => {
    setApprovers(
      approvers.map((approver) => (approver.id === id ? { ...approver, [field]: value } : approver))
    );
  };

  return (
    <Card
      className="w-full shadow-sm"
      style={{ borderRadius: "0.25rem", border: "1px solid #dddddd" }}
    >
      <CardContent>
        <div className="border-b border-gray-200 pb-6 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Información de aprobación */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Información de aprobación</h2>

            <div className="mb-6 space-y-2">
              <Label htmlFor="tipoAprobacion" className="text-sm font-medium text-gray-700">
                Solicitud de aprobación para
              </Label>
              <Select value={tipoAprobacion} onValueChange={setTipoAprobacion} required>
                <SelectTrigger
                  id="tipoAprobacion"
                  className="max-w-md border-2 focus:ring-2 focus:ring-blue-500"
                >
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viaje-especifico">Viaje específico</SelectItem>
                  <SelectItem value="tarifa-recurrente">Tarifa recurrente</SelectItem>
                  <SelectItem value="tercerizacion">Tercerización</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tipoAprobacion && <div className="space-y-6 pt-6">{renderValidationQuestions()}</div>}
          </div>

          {/* Forecast section */}
          <div className="mb-8 pb-8 border-t border-gray-200 pt-8">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Tarifas</h2>
              {calculateGrandTotal() > 25000000 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Alerta: Mayor a 25 mil dls
                </span>
              )}
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                      Proveedor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                      Vendor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                      Contrato
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                      Tipo de vehículo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                      Descripción tarifa
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                      Cotización
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                      Tarifa
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                      Cantidad de usos
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {forecastItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.proveedor}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.vendor}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.contrato}</td>
                      <td className="px-4 py-3 text-sm text-blue-600">{item.tipoVehiculo}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.descripcionTarifa}</td>
                      <td className="px-4 py-3">
                        <a
                          href={item.cotizacionUrl}
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                          download
                        >
                          <FileText className="h-4 w-4" />
                          <span>PDF</span>
                          <Download className="h-3 w-3" />
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        $ {item.tarifa.toLocaleString("es-CO")}
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          value={item.cantidadUsos}
                          onChange={(e) => updateCantidadUsos(item.id, e.target.value)}
                          min="0"
                          disabled={
                            tipoAprobacion === "viaje-especifico" ||
                            tipoAprobacion === "tercerizacion"
                          }
                          className="w-20 text-center border-2 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-600"
                          required
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        $ {calculateTotal(item.tarifa, item.cantidadUsos).toLocaleString("es-CO")}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={8} className="px-4 py-3 text-right text-sm text-gray-900">
                      Total
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {calculateGrandTotal().toLocaleString("es-CO")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {calculateGrandTotal() > 100000000 && (
            <div className="mb-8 pb-8 border-t border-gray-200 pt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Análisis comparativo</h2>
              <p className="text-sm text-gray-600 mb-6">
                El monto supera 100 millones de USD. Por favor, agregue tarifas comparativas para
                cada registro del forecast o marque la opción de Single source.
              </p>

              {!isSingleSource && (
                <div className="space-y-6 mb-6">
                  {forecastItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg shadow-sm">
                      {/* Header for each forecast item */}
                      <div
                        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleAnalysis(item.id)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">{item.proveedor}</h3>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                $ {item.tarifa.toLocaleString("es-CO")}
                              </div>
                              <div className="text-sm text-gray-600">
                                {item.tipoVehiculo} • Km {item.descripcionTarifa}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Vendor: {item.vendor} Contrato: {item.contrato}
                          </div>
                        </div>
                        <div className="ml-4">
                          {expandedAnalysis[item.id] ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                      </div>

                      {/* Comparison table for this forecast item */}
                      {expandedAnalysis[item.id] && (
                        <div className="p-4 bg-white">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                                    Proveedor
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                                    Tipo
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                                    Tipo vehículo
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                                    Tipo tarifa
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                                    Contrato
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                                    Tarifa
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                                    Diferencia
                                  </th>
                                  <th className="px-4 py-3"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {(comparisonRates[item.id] || []).map((rate) => (
                                  <tr key={rate.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                      <Input
                                        value={rate.proveedor}
                                        onChange={(e) =>
                                          updateComparisonRate(
                                            item.id,
                                            rate.id,
                                            "proveedor",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Proveedor"
                                        className="text-sm border-2 focus:ring-2 focus:ring-blue-500"
                                      />
                                    </td>
                                    <td className="px-4 py-3">
                                      <Input
                                        value={rate.tipo}
                                        onChange={(e) =>
                                          updateComparisonRate(
                                            item.id,
                                            rate.id,
                                            "tipo",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Tipo"
                                        className="text-sm border-2 focus:ring-2 focus:ring-blue-500"
                                      />
                                    </td>
                                    <td className="px-4 py-3">
                                      <Input
                                        value={rate.tipoVehiculo}
                                        onChange={(e) =>
                                          updateComparisonRate(
                                            item.id,
                                            rate.id,
                                            "tipoVehiculo",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Tipo vehículo"
                                        className="text-sm border-2 focus:ring-2 focus:ring-blue-500"
                                      />
                                    </td>
                                    <td className="px-4 py-3">
                                      <Input
                                        value={rate.tipoTarifa}
                                        onChange={(e) =>
                                          updateComparisonRate(
                                            item.id,
                                            rate.id,
                                            "tipoTarifa",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Tipo tarifa"
                                        className="text-sm border-2 focus:ring-2 focus:ring-blue-500"
                                      />
                                    </td>
                                    <td className="px-4 py-3">
                                      <Input
                                        value={rate.contrato}
                                        onChange={(e) =>
                                          updateComparisonRate(
                                            item.id,
                                            rate.id,
                                            "contrato",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Contrato"
                                        className="text-sm border-2 focus:ring-2 focus:ring-blue-500"
                                      />
                                    </td>
                                    <td className="px-4 py-3">
                                      <Input
                                        type="number"
                                        value={rate.tarifa}
                                        onChange={(e) =>
                                          updateComparisonRate(
                                            item.id,
                                            rate.id,
                                            "tarifa",
                                            Number(e.target.value)
                                          )
                                        }
                                        placeholder="Tarifa"
                                        className="text-sm w-32 border-2 focus:ring-2 focus:ring-blue-500"
                                      />
                                    </td>
                                    <td className="px-4 py-3">
                                      <Input
                                        type="number"
                                        value={rate.diferencia}
                                        onChange={(e) =>
                                          updateComparisonRate(
                                            item.id,
                                            rate.id,
                                            "diferencia",
                                            Number(e.target.value)
                                          )
                                        }
                                        placeholder="%"
                                        className="text-sm w-20 border-2 focus:ring-2 focus:ring-blue-500"
                                      />
                                    </td>
                                    <td className="px-4 py-3">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeComparisonRate(item.id, rate.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addComparisonRate(item.id)}
                            className="mt-4 border-2 hover:bg-gray-50"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar tarifa comparativa
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <Checkbox
                  id="singleSource"
                  checked={isSingleSource}
                  onCheckedChange={(checked) => setIsSingleSource(checked as boolean)}
                  className="mt-0.5 border-2 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                />
                <Label
                  htmlFor="singleSource"
                  className="text-sm text-gray-900 font-medium cursor-pointer leading-relaxed"
                >
                  Enviar solicitud de aprobación como Single source
                </Label>
              </div>
            </div>
          )}

          {/* Observaciones section */}
          <div className="mb-8 pb-8 border-t border-gray-200 pt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h2>
            <div className="space-y-2">
              <Label htmlFor="observaciones" className="text-sm font-medium text-gray-700">
                Comentarios adicionales (opcional)
              </Label>
              <Textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ingrese cualquier observación o comentario adicional sobre esta solicitud de aprobación..."
                className="min-h-[120px] border-2 focus:ring-2 focus:ring-blue-500 resize-none"
                rows={5}
              />
              <p className="text-xs text-gray-500">
                Puede incluir información adicional relevante para la aprobación
              </p>
            </div>
          </div>

          {/* Aprobadores section */}
          <div className="mb-8 pb-8 border-t border-gray-200 pt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Aprobadores</h2>
            <p className="text-sm text-gray-600 mb-6">
              Seleccione los aprobadores que revisarán esta solicitud. Debe incluir al menos un
              aprobador.
            </p>

            <div className="space-y-4">
              {approvers.map((approver, index) => (
                <div
                  key={approver.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor={`approver-name-${approver.id}`}
                        className="text-sm font-medium text-gray-700"
                      >
                        Nombre {index === 0 && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        id={`approver-name-${approver.id}`}
                        value={approver.name}
                        onChange={(e) => updateApprover(approver.id, "name", e.target.value)}
                        placeholder="Nombre del aprobador"
                        className="border-2 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor={`approver-email-${approver.id}`}
                        className="text-sm font-medium text-gray-700"
                      >
                        Correo electrónico {index === 0 && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        id={`approver-email-${approver.id}`}
                        type="email"
                        value={approver.email}
                        onChange={(e) => updateApprover(approver.id, "email", e.target.value)}
                        placeholder="correo@ejemplo.com"
                        className="border-2 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  {approvers.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeApprover(approver.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-8"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addApprover}
              className="mt-4 border-2 hover:bg-gray-50 bg-transparent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar aprobador adicional
            </Button>
          </div>

          <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="px-8 bg-transparent border-2"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="px-8 text-black font-semibold"
              style={{ backgroundColor: "#CBE71E" }}
            >
              Crear aprobación
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
