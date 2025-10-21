"use client";

import { Controller, type Control, type UseFormWatch, type UseFormSetValue } from "react-hook-form";
import type { INewApprovalForm } from "@/types/logistics/approval";
import { Label } from "@/modules/chat/ui/label";
import { Select } from "antd";
import { RadioGroup, RadioGroupItem } from "@/modules/chat/ui/radio-group";
import { Checkbox } from "@/modules/chat/ui/checkbox";
import useSWR from "swr";
import { getAllCarriers } from "@/services/logistics/users";

interface OutsourcingQuestionsProps {
  control: Control<INewApprovalForm>;
  watch: UseFormWatch<INewApprovalForm>;
  setValue: UseFormSetValue<INewApprovalForm>;
}

export function OutsourcingQuestions({ control, watch, setValue }: OutsourcingQuestionsProps) {
  const existenProveedoresZona = watch("existenProveedoresZona");

  const { data: carriersData, isLoading: isLoadingCarriers } = useSWR(
    "getAllCarriers",
    getAllCarriers,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="motivoTercerizacion" className="text-sm font-medium text-gray-700">
          Motivo por el cual esta tercerizando
        </Label>
        <Controller
          name="motivoTercerizacion"
          control={control}
          render={({ field }) => (
            <Select
              id="motivoTercerizacion"
              value={field.value}
              onChange={field.onChange}
              placeholder="Seleccionar motivo"
              className="max-w-md"
              style={{ width: "100%", height: 40 }}
              options={[
                { label: "No tenemos proveedores en la zona", value: "no-proveedores" },
                { label: "Lineamiento Social", value: "lineamiento-social" },
                { label: "Falta de disponibilidad con proveedor", value: "falta-disponibilidad" }
              ]}
            />
          )}
        />
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">
          Existen proveedores en la zona para prestar el servicio
        </Label>
        <Controller
          name="existenProveedoresZona"
          control={control}
          render={({ field }) => (
            <RadioGroup value={field.value} onValueChange={field.onChange} required>
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
          )}
        />
      </div>

      {existenProveedoresZona === "si" && (
        <div className="space-y-2">
          <Label htmlFor="proveedorSinDisponibilidad" className="text-sm font-medium text-gray-700">
            Proveedor local que no presento disponibilidad
          </Label>
          <Controller
            name="proveedorSinDisponibilidad"
            control={control}
            render={({ field }) => (
              <Select
                id="proveedorSinDisponibilidad"
                value={field.value}
                onChange={field.onChange}
                placeholder={
                  isLoadingCarriers ? "Cargando proveedores..." : "Seleccionar proveedor"
                }
                className="max-w-md"
                style={{ width: "100%", height: 40 }}
                loading={isLoadingCarriers}
                disabled={isLoadingCarriers}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                options={
                  carriersData?.data && carriersData.data.length > 0
                    ? carriersData.data.map((carrier) => ({
                        label: carrier.description,
                        value: carrier.id.toString()
                      }))
                    : []
                }
                notFoundContent="No hay proveedores disponibles"
              />
            )}
          />
        </div>
      )}

      <div className="flex items-start space-x-3 p-4 bg-purple-600 rounded-lg shadow-sm">
        <Controller
          name="aseguroHabilitar"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="aseguroHabilitar"
              checked={field.value}
              onCheckedChange={field.onChange}
              required
              className="mt-0.5 border-2 border-white data-[state=checked]:bg-white data-[state=checked]:text-purple-600"
            />
          )}
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
}
