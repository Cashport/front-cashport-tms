"use client";

import { Controller, type Control, type UseFormWatch, type UseFormSetValue } from "react-hook-form";
import type { INewApprovalForm } from "@/types/logistics/approval";
import { Label } from "@/modules/chat/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/modules/chat/ui/select";
import { RadioGroup, RadioGroupItem } from "@/modules/chat/ui/radio-group";
import { Checkbox } from "@/modules/chat/ui/checkbox";

interface OutsourcingQuestionsProps {
  control: Control<INewApprovalForm>;
  watch: UseFormWatch<INewApprovalForm>;
  setValue: UseFormSetValue<INewApprovalForm>;
}

export function OutsourcingQuestions({
  control,
  watch,
  setValue
}: OutsourcingQuestionsProps) {
  const existenProveedoresZona = watch("existenProveedoresZona");

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
            <Select value={field.value} onValueChange={field.onChange} required>
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
          <Label
            htmlFor="proveedorSinDisponibilidad"
            className="text-sm font-medium text-gray-700"
          >
            Proveedor local que no presento disponibilidad
          </Label>
          <Controller
            name="proveedorSinDisponibilidad"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} required>
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
