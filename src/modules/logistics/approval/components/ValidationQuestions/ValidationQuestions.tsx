"use client";

import type React from "react";
import { SpecificTripQuestions } from "./SpecificTripQuestions";
import { RecurringRateQuestions } from "./RecurringRateQuestions";
import { OutsourcingQuestions } from "./OutsourcingQuestions";

interface ValidationQuestionsProps {
  tipoAprobacion: string;
  validadoCoordinador: string;
  setValidadoCoordinador: (value: string) => void;
  proveedorRecomendado: string;
  setProveedorRecomendado: (value: string) => void;
  emailConfirmacionFile: File | null;
  setEmailConfirmacionFile: (file: File | null) => void;
  handleEmailFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  motivoTercerizacion: string;
  setMotivoTercerizacion: (value: string) => void;
  existenProveedoresZona: string;
  setExistenProveedoresZona: (value: string) => void;
  proveedorSinDisponibilidad: string;
  setProveedorSinDisponibilidad: (value: string) => void;
  aseguroHabilitar: boolean;
  setAseguroHabilitar: (value: boolean) => void;
}

export function ValidationQuestions({
  tipoAprobacion,
  validadoCoordinador,
  setValidadoCoordinador,
  proveedorRecomendado,
  setProveedorRecomendado,
  emailConfirmacionFile,
  setEmailConfirmacionFile,
  handleEmailFileChange,
  motivoTercerizacion,
  setMotivoTercerizacion,
  existenProveedoresZona,
  setExistenProveedoresZona,
  proveedorSinDisponibilidad,
  setProveedorSinDisponibilidad,
  aseguroHabilitar,
  setAseguroHabilitar
}: ValidationQuestionsProps) {
  switch (tipoAprobacion) {
    case "viaje-especifico":
      return (
        <SpecificTripQuestions
          validadoCoordinador={validadoCoordinador}
          setValidadoCoordinador={setValidadoCoordinador}
          proveedorRecomendado={proveedorRecomendado}
          setProveedorRecomendado={setProveedorRecomendado}
          emailConfirmacionFile={emailConfirmacionFile}
          setEmailConfirmacionFile={setEmailConfirmacionFile}
          handleEmailFileChange={handleEmailFileChange}
          idPrefix="specific"
        />
      );

    case "tarifa-recurrente":
      return (
        <RecurringRateQuestions
          validadoCoordinador={validadoCoordinador}
          setValidadoCoordinador={setValidadoCoordinador}
          proveedorRecomendado={proveedorRecomendado}
          setProveedorRecomendado={setProveedorRecomendado}
          emailConfirmacionFile={emailConfirmacionFile}
          setEmailConfirmacionFile={setEmailConfirmacionFile}
          handleEmailFileChange={handleEmailFileChange}
          idPrefix="recurring"
        />
      );

    case "tercerizacion":
      return (
        <OutsourcingQuestions
          motivoTercerizacion={motivoTercerizacion}
          setMotivoTercerizacion={setMotivoTercerizacion}
          existenProveedoresZona={existenProveedoresZona}
          setExistenProveedoresZona={setExistenProveedoresZona}
          proveedorSinDisponibilidad={proveedorSinDisponibilidad}
          setProveedorSinDisponibilidad={setProveedorSinDisponibilidad}
          aseguroHabilitar={aseguroHabilitar}
          setAseguroHabilitar={setAseguroHabilitar}
        />
      );

    default:
      return null;
  }
}
