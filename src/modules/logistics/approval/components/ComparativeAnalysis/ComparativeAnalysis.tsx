"use client";

import { useState } from "react";
import { Controller, Control } from "react-hook-form";
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { Label } from "@/modules/chat/ui/label";
import { Input } from "@/modules/chat/ui/input";
import { Button } from "@/modules/chat/ui/button";
import { Checkbox } from "@/modules/chat/ui/checkbox";
import type {
  INewApprovalForm,
  ForecastItem,
  ComparisonRate
} from "@/types/logistics/approval";

interface ComparativeAnalysisProps {
  forecastItems: ForecastItem[];
  comparisonRates: Record<string, ComparisonRate[]>;
  isSingleSource: boolean;
  control: Control<INewApprovalForm>;
  onUpdateComparisonRate: (
    forecastItemId: string,
    rateId: string,
    field: keyof ComparisonRate,
    value: string | number
  ) => void;
  onRemoveComparisonRate: (forecastItemId: string, rateId: string) => void;
  onOpenModalCarrierPricing: (forecastItemId: string) => void;
  calculateGrandTotal: () => number;
}

export function ComparativeAnalysis({
  forecastItems,
  comparisonRates,
  isSingleSource,
  control,
  onUpdateComparisonRate,
  onRemoveComparisonRate,
  onOpenModalCarrierPricing,
  calculateGrandTotal
}: ComparativeAnalysisProps) {
  // Local state for expanded accordion items
  const [expandedAnalysis, setExpandedAnalysis] = useState<Record<string, boolean>>({});

  const toggleAnalysis = (forecastItemId: string) => {
    setExpandedAnalysis({
      ...expandedAnalysis,
      [forecastItemId]: !expandedAnalysis[forecastItemId]
    });
  };

  // Only render if total exceeds threshold
  if (calculateGrandTotal() <= 100000000) {
    return null;
  }

  return (
    <div className="mb-8 pb-8 border-t border-gray-200 pt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Análisis comparativo</h2>
      <p className="text-sm text-gray-600 mb-6">
        El monto supera 25 mil USD. Por favor, agregue tarifas comparativas para cada registro del
        forecast o marque la opción de Single source.
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

              {/* Comparison table for forecast items */}
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
                                  onUpdateComparisonRate(item.id, rate.id, "proveedor", e.target.value)
                                }
                                placeholder="Proveedor"
                                className="text-sm border-2 focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                value={rate.tipo}
                                onChange={(e) =>
                                  onUpdateComparisonRate(item.id, rate.id, "tipo", e.target.value)
                                }
                                placeholder="Tipo"
                                className="text-sm border-2 focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                value={rate.tipoVehiculo}
                                onChange={(e) =>
                                  onUpdateComparisonRate(
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
                                  onUpdateComparisonRate(item.id, rate.id, "tipoTarifa", e.target.value)
                                }
                                placeholder="Tipo tarifa"
                                className="text-sm border-2 focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                value={rate.contrato}
                                onChange={(e) =>
                                  onUpdateComparisonRate(item.id, rate.id, "contrato", e.target.value)
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
                                  onUpdateComparisonRate(
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
                                  onUpdateComparisonRate(
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
                                onClick={() => onRemoveComparisonRate(item.id, rate.id)}
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
                    onClick={() => onOpenModalCarrierPricing(item.id)}
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
        <Controller
          name="isSingleSource"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="singleSource"
              checked={field.value}
              onCheckedChange={field.onChange}
              className="mt-0.5 border-2 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
            />
          )}
        />
        <Label
          htmlFor="singleSource"
          className="text-sm text-gray-900 font-medium cursor-pointer leading-relaxed"
        >
          Enviar solicitud de aprobación como Single source
        </Label>
      </div>
    </div>
  );
}
