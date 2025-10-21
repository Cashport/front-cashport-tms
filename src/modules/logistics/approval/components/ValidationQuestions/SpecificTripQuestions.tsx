"use client";

import type React from "react";
import { Controller, type Control, type UseFormWatch, type UseFormSetValue } from "react-hook-form";
import type { INewApprovalForm } from "@/types/logistics/approval";
import { FileText, X } from "lucide-react";
import { Label } from "@/modules/chat/ui/label";
import { RadioGroup, RadioGroupItem } from "@/modules/chat/ui/radio-group";
import { Input } from "@/modules/chat/ui/input";
import { Button } from "@/modules/chat/ui/button";

interface SpecificTripQuestionsProps {
  control: Control<INewApprovalForm>;
  watch: UseFormWatch<INewApprovalForm>;
  setValue: UseFormSetValue<INewApprovalForm>;
  handleEmailFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  idPrefix?: string;
}

export function SpecificTripQuestions({
  control,
  watch,
  setValue,
  handleEmailFileChange,
  idPrefix = "specific"
}: SpecificTripQuestionsProps) {
  const proveedorRecomendado = watch("proveedorRecomendado");
  const emailConfirmacionFile = watch("emailConfirmacionFile");

  return (
    <>
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">
          Valido previamente con el coordinador de la zona que no haya un contrato activo para
          este scope?
        </Label>
        <Controller
          name="validadoCoordinador"
          control={control}
          render={({ field }) => (
            <RadioGroup value={field.value} onValueChange={field.onChange} required>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="si" id={`validado-si-${idPrefix}`} className="border-2" />
                  <Label
                    htmlFor={`validado-si-${idPrefix}`}
                    className="font-normal cursor-pointer text-gray-700"
                  >
                    Sí
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id={`validado-no-${idPrefix}`} className="border-2" />
                  <Label
                    htmlFor={`validado-no-${idPrefix}`}
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

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">
          ¿Este proveedor es recomendado por el departamento de sostenibilidad?
        </Label>
        <Controller
          name="proveedorRecomendado"
          control={control}
          render={({ field }) => (
            <RadioGroup value={field.value} onValueChange={field.onChange} required>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="si" id={`recomendado-si-${idPrefix}`} className="border-2" />
                  <Label
                    htmlFor={`recomendado-si-${idPrefix}`}
                    className="font-normal cursor-pointer text-gray-700"
                  >
                    Sí
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id={`recomendado-no-${idPrefix}`} className="border-2" />
                  <Label
                    htmlFor={`recomendado-no-${idPrefix}`}
                    className="font-normal cursor-pointer text-gray-700"
                  >
                    No
                  </Label>
                </div>
              </div>
            </RadioGroup>
          )}
        />

        {proveedorRecomendado === "si" && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Label
              htmlFor={`emailConfirmacion-${idPrefix}`}
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Adjuntar correo de confirmación
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id={`emailConfirmacion-${idPrefix}`}
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
                  onClick={() => setValue("emailConfirmacionFile", null)}
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
}
