"use client";

import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import useSWR from "swr";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Select as AntSelect, message } from "antd";
import { ArrowLeft, Plus, X } from "lucide-react";

import { useAppStore } from "@/lib/store/store";
import {
  createApproval,
  getApprovers,
  getTypes,
  type IApprovalRequest
} from "@/services/logistics/pricingApprovals/pricingApprovals";

import { approvalFormSchema } from "@/modules/logistics/approval/schemas/approvalFormSchema";
import { Label } from "@/modules/chat/ui/label";
import { Card, CardContent } from "@/modules/chat/ui/card";
import { Textarea } from "@/modules/chat/ui/textarea";
import { Input } from "@/modules/chat/ui/input";
import { Button } from "@/modules/chat/ui/button";
import { ValidationQuestions } from "@/modules/logistics/approval/components/ValidationQuestions";
import { ComparativeAnalysis } from "@/modules/logistics/approval/components/ComparativeAnalysis/ComparativeAnalysis";
import ModalSelectCarrierPricingComparison, {
  ICarriersPricingWithCheck
} from "@/components/organisms/logistics/orders/transfer_request/components/modals/ModalSelectCarrierPricingComparison";
import CarriersFeeTable from "@/components/molecules/tables/CarriersFeeTable";

import { defaultApprovalFormValues } from "@/types/logistics/approval";
import type {
  INewApprovalForm,
  ForecastItem,
  ComparisonRate,
  Approver
} from "@/types/logistics/approval";
import { IApprovalType, IApprover, ITransferRequestJourneyReview } from "@/types/logistics/schema";

import "@/modules/chat/styles/chatStyles.css";

dayjs.extend(utc);

// Helper function to normalize approval type names to kebab-case
const normalizeToKebabCase = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/\s+/g, "-"); // Replace spaces with hyphens
};

export function NewApprovalForm() {
  // Zustand store - Carrier for Approval slice
  const selectedCarriers = useAppStore((state) => state.selectedCarriers);
  const transferRequestId = useAppStore((state) => state.transferRequestId);
  const clearCarrierForApproval = useAppStore((state) => state.clearCarrierForApproval);
  const [isModalCarrierComparisonOpen, setIsModalCarrierComparisonOpen] = useState({
    open: false,
    carrierRequestId: 0
  });

  const router = useRouter();

  // Fetch approval types from API
  const { data: approvalTypes, isLoading: isLoadingTypes } = useSWR<IApprovalType[]>(
    "pricing-approval-types",
    getTypes,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  // Fetch Approvers from API
  const { data: approverOptions, isLoading: isLoadingApprovers } = useSWR<IApprover[]>(
    "pricing-approval-approvers",
    getApprovers,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  // Initialize default values with selectedCarriers
  const initialFormValues = useMemo<INewApprovalForm>(() => {
    const forecastItems: ForecastItem[] =
      selectedCarriers && selectedCarriers.length > 0
        ? selectedCarriers.map((carrier) => ({
            id: carrier.id.toString(),
            proveedor: carrier.carrier,
            vendor: carrier.id_carrier.toString(),
            contrato: carrier.driver_contract,
            tipoVehiculo: carrier.vehicles,
            descripcionTarifa: carrier.service_type,
            tarifa: carrier.amount,
            cantidadUsos: 1,
            cotizacionUrl: ""
          }))
        : [];

    return {
      ...defaultApprovalFormValues,
      forecastItems
    };
  }, [selectedCarriers]);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<INewApprovalForm>({
    resolver: yupResolver(approvalFormSchema) as any,
    defaultValues: initialFormValues,
    mode: "onBlur"
  });

  // Watch form values for reactive UI
  const tipoAprobacion = watch("tipoAprobacion");
  const forecastItems = watch("forecastItems");
  const comparisonRates = watch("comparisonRates");
  const isSingleSource = watch("isSingleSource");
  const approvers = watch("approvers");

  // Helper: Update cantidad de usos for forecast items
  const updateCantidadUsos = (id: string, value: string) => {
    if (tipoAprobacion === "viaje-especifico" || tipoAprobacion === "tercerizacion") {
      return;
    }
    const cantidad = Number.parseInt(value) || 0;
    const updatedItems = forecastItems.map((item) =>
      item.id === id ? { ...item, cantidadUsos: cantidad } : item
    );
    setValue("forecastItems", updatedItems);
  };

  // Helper: Handle email file change
  const handleEmailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setValue("emailConfirmacionFile", e.target.files[0]);
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

  // Helper: Remove comparison rate
  const removeComparisonRate = (forecastItemId: string, rateId: string) => {
    const updated = {
      ...comparisonRates,
      [forecastItemId]: (comparisonRates[forecastItemId] || []).filter((rate) => rate.id !== rateId)
    };
    setValue("comparisonRates", updated);
  };

  /**
   * Prepare approval data by transforming form data into API-compatible format
   */
  const prepareApprovalData = (data: INewApprovalForm): IApprovalRequest => {
    // Find the approval type ID from the selected kebab-case string
    const approvalType = approvalTypes?.find(
      (type) => normalizeToKebabCase(type.name) === data.tipoAprobacion
    );

    if (!approvalType) {
      throw new Error("Tipo de aprobación no válido");
    }

    // Transform forecastItems to pricings array
    const pricings = data.forecastItems.map((item) => {
      // Get comparison pricing IDs for this forecast item
      const comparationPricings = (data.comparisonRates[item.id] || [])
        .map((rate) => {
          const numericId = Number.parseInt(rate.id.replace(/\D/g, ""));
          return isNaN(numericId) ? 0 : numericId;
        })
        .filter((id) => id > 0);

      return {
        carrier_request_id: Number.parseInt(item.id),
        quantity: item.cantidadUsos,
        comparation_pricings: comparationPricings
      };
    });

    // Transform approvers to get user IDs
    const approversData = data.approvers
      .map((approver) => {
        const approverOption = approverOptions?.find((opt) => opt.name === approver.name);
        return approverOption ? { id_user: approverOption.id } : null;
      })
      .filter((approver): approver is { id_user: number } => approver !== null);

    // Build the request object
    const requestData: IApprovalRequest = {
      id_approval_type: approvalType.id,
      pricings,
      approvers: approversData,
      send_single_source: data.isSingleSource,
      is_another_contract_active: data.validadoCoordinador === "si",
      is_provider_recommended_by_sustainability: data.proveedorRecomendado === "si",
      tercerization_motive: data.motivoTercerizacion || "",
      exists_another_provider_in_zone: data.existenProveedoresZona === "si",
      subcontractor_ensure: data.aseguroHabilitar,
      observations: data.observaciones || ""
    };

    return requestData;
  };

  /**
   * Handle form submission
   * React Hook Form handles validation via Yup schema
   */
  const onSubmit = async (data: INewApprovalForm) => {
    try {
      // Prepare the structured data for API submission
      const requestData = prepareApprovalData(data);
      // Submit the approval request with optional file
      await createApproval(requestData, data.emailConfirmacionFile || undefined);
      message.success("Solicitud de aprobación creada exitosamente.");

      // Navigate back to transfer request detail after successful creation
      router.push(`/logistics/transfer-request/${transferRequestId}`);
      clearCarrierForApproval();
    } catch (error) {
      console.error("❌ Error creating approval:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error al crear la solicitud de aprobación.";
      message.error(errorMessage);
    }
  };

  /**
   * Handle form errors - called when validation fails
   */
  const onError = (errors: any) => {
    console.group("❌ VALIDATION ERRORS DETECTED");
    console.error("Raw errors object:", errors);

    // Detailed table view
    console.table(
      Object.entries(errors).map(([field, error]: [string, any]) => ({
        Campo: field,
        Mensaje: error?.message || "Error desconocido",
        Tipo: error?.type,
        Ref: error?.ref?.name || "N/A"
      }))
    );

    // Check for nested errors in arrays/objects (forecastItems, approvers, comparisonRates)
    Object.entries(errors).forEach(([field, error]: [string, any]) => {
      if (error && typeof error === "object" && !error.message) {
        console.error(`📦 Nested errors in "${field}":`, error);
      }
    });

    console.groupEnd();

    // Helper function to extract first error message (including nested errors)
    const getFirstErrorMessage = (errorsObj: any): string | null => {
      for (const [field, error] of Object.entries(errorsObj)) {
        // Direct error message
        if ((error as any)?.message) {
          return `${field}: ${(error as any).message}`;
        }

        // Nested array errors (e.g., forecastItems[0].cantidadUsos)
        if (Array.isArray(error)) {
          for (let i = 0; i < error.length; i++) {
            if (error[i]) {
              const nestedMsg = getFirstErrorMessage(error[i]);
              if (nestedMsg) {
                return `${nestedMsg}`;
              }
            }
          }
        }

        // Nested object errors (e.g., comparisonRates.root)
        if (error && typeof error === "object" && !Array.isArray(error)) {
          const nestedMsg = getFirstErrorMessage(error);
          if (nestedMsg) {
            return `${nestedMsg}`;
          }
        }
      }
      return null;
    };

    // Show first error message to user
    const firstErrorMessage =
      getFirstErrorMessage(errors) || "Por favor, corrija los errores en el formulario";
    message.error(firstErrorMessage);
  };

  // Helper: Add new approver
  const addApprover = () => {
    const newApprover: Approver = {
      id: Date.now().toString(),
      name: "",
      email: ""
    };
    setValue("approvers", [...approvers, newApprover]);
  };

  // Helper: Remove approver
  const removeApprover = (id: string) => {
    if (approvers.length > 1) {
      setValue(
        "approvers",
        approvers.filter((approver) => approver.id !== id)
      );
    }
  };

  // Helper: Update approver field
  const updateApprover = (id: string, field: keyof Approver, value: string) => {
    setValue(
      "approvers",
      approvers.map((approver) => (approver.id === id ? { ...approver, [field]: value } : approver))
    );
  };

  // Helper: Handle approver selection from dropdown
  const handleApproverSelect = (approverId: string, approverApiId: number) => {
    const selectedApprover = approverOptions?.find((opt) => opt.id === approverApiId);
    if (selectedApprover) {
      setValue(
        "approvers",
        approvers.map((approver) =>
          approver.id === approverId
            ? {
                ...approver,
                name: selectedApprover.name,
                email: selectedApprover.email
              }
            : approver
        )
      );
    }
  };

  const handleGoBack = () => {
    router.push(`/logistics/transfer-request/${transferRequestId}`);
    clearCarrierForApproval();
  };

  const handleTipoAprobacionChange = (newTipoAprobacion: string) => {
    // Reset all ValidationQuestions fields when tipoAprobacion changes
    setValue("validadoCoordinador", "");
    setValue("proveedorRecomendado", "");
    setValue("emailConfirmacionFile", null);
    setValue("motivoTercerizacion", "");
    setValue("existenProveedoresZona", "");
    setValue("proveedorSinDisponibilidad", "");
    setValue("aseguroHabilitar", false);

    // Update the tipoAprobacion value
    setValue("tipoAprobacion", newTipoAprobacion);
  };

  const handleOpenModalCarrierPricing = (forecastItemId: string) => {
    setIsModalCarrierComparisonOpen({ open: true, carrierRequestId: Number(forecastItemId) });
  };

  const handleAddCarrierComparison = (
    selectedCarriers: ICarriersPricingWithCheck[],
    carrierRequestId: number
  ) => {
    // Convert carrierRequestId to string to match forecastItemId format
    const forecastItemId = carrierRequestId.toString();

    // Find the original forecast item to get the original price
    const originalForecastItem = forecastItems.find((item) => item.id === forecastItemId);
    const originalPrice = originalForecastItem?.tarifa || 0;

    // Get existing comparison rates for this forecast item
    const existingRates = comparisonRates[forecastItemId] || [];

    // Transform selected carriers to ComparisonRate format
    const newComparisonRates: ComparisonRate[] = selectedCarriers.map((carrier) => {
      const carrierPrice = carrier.price || 0;

      // Calculate absolute difference: carrierPrice - originalPrice
      // Positive value means carrier is more expensive, negative means cheaper
      const diferencia = carrierPrice - originalPrice;

      return {
        id: carrier.id_carrier_pricing.toString(),
        proveedor: carrier.Proveedor || "",
        tipo: "-",
        tipoVehiculo: originalForecastItem?.tipoVehiculo || "",
        tipoTarifa: carrier.fee_description || "",
        contrato: "", // Not available in ICarriersPricingWithCheck, leave empty for user to fill
        tarifa: carrierPrice,
        diferencia
      };
    });

    // Filter out duplicates based on id_carrier_pricing
    const existingIds = new Set(existingRates.map((rate) => rate.id));
    const uniqueNewRates = newComparisonRates.filter((rate) => !existingIds.has(rate.id));

    // Combine existing and new rates
    const updatedRates = [...existingRates, ...uniqueNewRates];

    // Update comparison rates for this forecast item
    const updatedComparisonRates = {
      ...comparisonRates,
      [forecastItemId]: updatedRates
    };

    // Update form state
    setValue("comparisonRates", updatedComparisonRates);
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
            onClick={handleGoBack}
            className="text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* Información de aprobación */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Información de aprobación</h2>

          <div className="mb-6 space-y-2">
            <Label htmlFor="tipoAprobacion" className="text-sm font-medium text-gray-700">
              Solicitud de aprobación para
            </Label>
            <Controller
              name="tipoAprobacion"
              control={control}
              render={({ field }) => (
                <AntSelect
                  id="tipoAprobacion"
                  value={field.value}
                  onChange={handleTipoAprobacionChange}
                  placeholder="Seleccionar tipo"
                  className="max-w-md"
                  style={{ width: "100%" }}
                  size="large"
                  loading={isLoadingTypes}
                  options={approvalTypes?.map((type) => ({
                    label: type.name,
                    value: normalizeToKebabCase(type.name)
                  }))}
                />
              )}
            />
            {errors.tipoAprobacion && (
              <p className="text-sm text-red-600 mt-1">{errors.tipoAprobacion.message}</p>
            )}
          </div>

          {tipoAprobacion && (
            <div className="space-y-6 pt-6">
              <ValidationQuestions
                control={control}
                watch={watch}
                setValue={setValue}
                tipoAprobacion={tipoAprobacion}
                handleEmailFileChange={handleEmailFileChange}
              />
            </div>
          )}
        </div>

        {/* Forecast section */}
        <div className="mb-8 pb-8 border-t border-gray-200 pt-8">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Tarifas</h2>
            {calculateGrandTotal() > 100000000 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Alerta: Mayor a 25 mil USD
              </span>
            )}
          </div>

          <CarriersFeeTable
            forecastItems={forecastItems}
            tipoAprobacion={tipoAprobacion}
            onCantidadUsosChange={updateCantidadUsos}
          />
        </div>

        <ComparativeAnalysis
          forecastItems={forecastItems}
          comparisonRates={comparisonRates}
          isSingleSource={isSingleSource}
          control={control}
          onRemoveComparisonRate={removeComparisonRate}
          onOpenModalCarrierPricing={handleOpenModalCarrierPricing}
          calculateGrandTotal={calculateGrandTotal}
        />

        {/* Observaciones section */}
        <div className="mb-8 pb-8 border-t border-gray-200 pt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h2>
          <div className="space-y-2">
            <Label htmlFor="observaciones" className="text-sm font-medium text-gray-700">
              Comentarios adicionales (opcional)
            </Label>
            <Controller
              name="observaciones"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="observaciones"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Ingrese cualquier observación o comentario adicional sobre esta solicitud de aprobación..."
                  className="min-h-[120px] border-2 focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={5}
                />
              )}
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
                    <AntSelect
                      id={`approver-name-${approver.id}`}
                      value={
                        approver.name
                          ? approverOptions?.find((opt) => opt.name === approver.name)?.id
                          : undefined
                      }
                      onChange={(value: number) => handleApproverSelect(approver.id, value)}
                      placeholder="Seleccionar aprobador"
                      style={{ width: "100%", height: 36 }}
                      loading={isLoadingApprovers}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                      }
                      options={approverOptions?.map((opt) => ({
                        label: opt.name,
                        value: opt.id
                      }))}
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
                      disabled
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
            onClick={handleGoBack}
            className="px-8 bg-transparent border-2"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="px-8 text-black font-semibold"
            style={{ backgroundColor: "#CBE71E" }}
            onClick={handleSubmit(onSubmit, onError)}
          >
            Crear aprobación
          </Button>
        </div>
      </CardContent>

      <ModalSelectCarrierPricingComparison
        open={isModalCarrierComparisonOpen.open}
        onClose={() => setIsModalCarrierComparisonOpen({ open: false, carrierRequestId: 0 })}
        carrierRequestId={isModalCarrierComparisonOpen.carrierRequestId}
        handleSuccess={handleAddCarrierComparison}
      />
    </Card>
  );
}
