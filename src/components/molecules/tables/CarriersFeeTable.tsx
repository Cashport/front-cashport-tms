import { FileText, Download } from "lucide-react";
import { Input } from "@/modules/chat/ui/input";
import type { ForecastItem } from "@/types/logistics/approval";

interface CarriersFeeTableProps {
  forecastItems: ForecastItem[];
  tipoAprobacion: string;
  noInput?: boolean;
  onCantidadUsosChange?: (id: string, value: string) => void;
  onDownloadQuote?: (url: string, proveedor: string) => void;
}

export default function CarriersFeeTable({
  forecastItems,
  tipoAprobacion,
  noInput = false,
  onCantidadUsosChange,
  onDownloadQuote
}: CarriersFeeTableProps) {
  // Helper: Calculate total for a single item
  const calculateTotal = (tarifa: number, cantidad: number) => {
    return tarifa * cantidad;
  };

  // Helper: Calculate grand total for all items
  const calculateGrandTotal = () => {
    return forecastItems.reduce((sum, item) => {
      return sum + calculateTotal(item.tarifa, item.cantidadUsos);
    }, 0);
  };

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
      <table className="w-full min-w-max">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Proveedor</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Vendor</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Contrato</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
              Tipo de vehículo
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
              Descripción tarifa
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Cotización</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Tarifa</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Usos</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Total</th>
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
              <td className="py-3 px-4 text-center">
                <button
                  type="button"
                  onClick={() =>
                    onDownloadQuote && onDownloadQuote(item.cotizacionUrl!, item.proveedor)
                  }
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  title="Descargar cotización"
                >
                  <FileText className="h-4 w-4" />
                  <span>PDF</span>
                  <Download className="h-3.5 w-3.5" />
                </button>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                $ {item.tarifa.toLocaleString("es-CO")}
              </td>
              <td className="px-4 py-3">
                {noInput ? (
                  item.cantidadUsos
                ) : (
                  <Input
                    type="number"
                    value={item.cantidadUsos}
                    onChange={(e) =>
                      onCantidadUsosChange && onCantidadUsosChange(item.id, e.target.value)
                    }
                    min="0"
                    disabled={
                      tipoAprobacion === "viaje-especifico" || tipoAprobacion === "tercerizacion"
                    }
                    className="w-20 text-center border-2 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-600"
                    required
                  />
                )}
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
              $ {calculateGrandTotal().toLocaleString("es-CO")}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
