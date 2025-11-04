"use client";

import type React from "react";
import type { Control, UseFormWatch, UseFormSetValue } from "react-hook-form";
import type { INewApprovalForm } from "@/types/logistics/approval";
import { CommonApprovalQuestions } from "./CommonApprovalQuestions";
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
    case "tarifa-recurrente":
      return (
        <CommonApprovalQuestions
          control={control}
          watch={watch}
          setValue={setValue}
          handleEmailFileChange={handleEmailFileChange}
          idPrefix={tipoAprobacion === "viaje-especifico" ? "specific" : "recurring"}
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
