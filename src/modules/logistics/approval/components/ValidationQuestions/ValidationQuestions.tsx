"use client";

import type React from "react";
import type { Control, UseFormWatch, UseFormSetValue } from "react-hook-form";
import type { INewApprovalForm } from "@/types/logistics/approval";
import { SpecificTripQuestions } from "./SpecificTripQuestions";
import { RecurringRateQuestions } from "./RecurringRateQuestions";
import { OutsourcingQuestions } from "./OutsourcingQuestions";

interface ValidationQuestionsProps {
  control: Control<INewApprovalForm>;
  watch: UseFormWatch<INewApprovalForm>;
  setValue: UseFormSetValue<INewApprovalForm>;
  tipoAprobacion: string;
  handleEmailFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ValidationQuestions({
  control,
  watch,
  setValue,
  tipoAprobacion,
  handleEmailFileChange
}: ValidationQuestionsProps) {
  switch (tipoAprobacion) {
    case "viaje-especifico":
      return (
        <SpecificTripQuestions
          control={control}
          watch={watch}
          setValue={setValue}
          handleEmailFileChange={handleEmailFileChange}
          idPrefix="specific"
        />
      );

    case "tarifa-recurrente":
      return (
        <RecurringRateQuestions
          control={control}
          watch={watch}
          setValue={setValue}
          handleEmailFileChange={handleEmailFileChange}
          idPrefix="recurring"
        />
      );

    case "tercerizacion":
      return (
        <OutsourcingQuestions
          control={control}
          watch={watch}
          setValue={setValue}
        />
      );

    default:
      return null;
  }
}
