"use client";

import { useState } from "react";
import { Controller, Control } from "react-hook-form";
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { Label } from "@/modules/chat/ui/label";
import { Button } from "@/modules/chat/ui/button";
import { Checkbox } from "@/modules/chat/ui/checkbox";
import type { INewApprovalForm, ForecastItem, ComparisonRate } from "@/types/logistics/approval";

interface ComparativeAnalysisProps {
  forecastItems: ForecastItem[];
  comparisonRates: Record<string, ComparisonRate[]>;
  control: Control<INewApprovalForm>;
  onRemoveComparisonRate: (forecastItemId: string, rateId: string) => void;
  onOpenModalCarrierPricing: (forecastItemId: string) => void;
  calculateGrandTotal: () => number;
  tipoAprobacion: string;
}

export function ComparativeAnalysis({
  forecastItems,
  comparisonRates,
  control,
  onRemoveComparisonRate,
  onOpenModalCarrierPricing,
  calculateGrandTotal,
  tipoAprobacion
}: ComparativeAnalysisProps) {
  // Local state for expanded accordion items
  const [expandedAnalysis, setExpandedAnalysis] = useState<Record<string, boolean>>({});

  const toggleAnalysis = (forecastItemId: string) => {
    setExpandedAnalysis({
      ...expandedAnalysis,
      [forecastItemId]: !expandedAnalysis[forecastItemId]
    });
  };

  // Calculate balance percentage: difference between main rate and average of comparison rates
  const calculateBalancePercentage = (item: ForecastItem) => {
    const itemComparisonRates = comparisonRates[item.id] || [];

    // Don't show balance if there are no comparison rates
    if (itemComparisonRates.length === 0) {
      return null;
    }

    // Calculate average of comparison rates
    const sumOfComparisonRates = itemComparisonRates.reduce((sum, rate) => sum + rate.tarifa, 0);
    const average = sumOfComparisonRates / itemComparisonRates.length;

    // Protect against division by zero
    if (average === 0) {
      return null;
    }

    // Calculate percentage difference: ((mainRate - average) / average) * 100
    const difference = item.tarifa - average;
    const percentage = (difference / average) * 100;

    return {
      percentage: percentage.toFixed(2),
      isPositive: percentage > 0,
      formattedPercentage: `${percentage > 0 ? "+" : ""}${percentage.toFixed(1)}%`
    };
  };

  if (tipoAprobacion !== "tarifa-recurrente") {
    return null;
  }

  return (
    <div className="mb-8 pb-8 border-t border-gray-200 pt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Análisis comparativo</h2>
      {calculateGrandTotal() > 100000000 && (
        <p className="text-sm text-gray-600 mb-6">
          El monto supera 25 mil USD. Por favor, agregue tarifas comparativas para cada registro del
          forecast o marque la opción de Single source.
        </p>
      )}

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
                  <div className="flex items-start gap-2">
                    {/* General balance: percentage difference between main rate and average of comparison rates */}
                    {(() => {
                      const balance = calculateBalancePercentage(item);
                      if (!balance) return null;

                      return (
                        <div
                          className={`text-lg font-semibold ${
                            balance.isPositive ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {balance.formattedPercentage}
                        </div>
                      );
                    })()}
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        $ {item.tarifa.toLocaleString("es-CO")}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.tipoVehiculo} • Km {item.descripcionTarifa}
                      </div>
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
                            <span className="text-sm text-gray-900">{rate.proveedor || "-"}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-900">{rate.tipo || "-"}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-900">
                              {rate.tipoVehiculo || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-900">{rate.tipoTarifa || "-"}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-900">{rate.contrato || "-"}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-gray-900">
                              $ {rate.tarifa.toLocaleString("es-CO")}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-medium text-gray-900`}>
                              {(() => {
                                // Calculate percentage difference, protecting against division by zero
                                const percentage =
                                  item.tarifa !== 0
                                    ? ((rate.tarifa - item.tarifa) / item.tarifa) * 100
                                    : 0;
                                const sign = percentage > 0 ? "+" : "";
                                return `${sign}${percentage.toFixed(2)}%`;
                              })()}
                            </span>
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
    </div>
  );
}
