import * as yup from "yup";
import type { INewApprovalForm } from "@/types/logistics/approval";

/**
 * Yup validation schema for NewApprovalForm
 * Includes conditional validations based on approval type
 */
export const approvalFormSchema = yup.object({
  // General fields
  tipoAprobacion: yup.string().required("Debe seleccionar un tipo de aprobación").default(""),

  observaciones: yup.string().default(""),

  isSingleSource: yup.boolean().default(false),

  // Conditional validations for Specific Trip and Recurring Rate
  validadoCoordinador: yup
    .string()
    .default("")
    .when("tipoAprobacion", {
      is: (val: string) => val === "viaje-especifico" || val === "tarifa-recurrente",
      then: (schema) => schema.required("Debe responder si validó con el coordinador de la zona")
    }),

  proveedorRecomendado: yup
    .string()
    .default("")
    .when("tipoAprobacion", {
      is: (val: string) => val === "viaje-especifico" || val === "tarifa-recurrente",
      then: (schema) =>
        schema.required("Debe indicar si el proveedor es recomendado por sostenibilidad")
    }),

  emailConfirmacionFile: yup
    .mixed()
    .default(null)
    .nullable()
    .when(["tipoAprobacion", "proveedorRecomendado"], {
      is: (tipo: string, recomendado: string) =>
        (tipo === "viaje-especifico" || tipo === "tarifa-recurrente") && recomendado === "1",
      then: (schema) =>
        schema.test(
          "required-file",
          "Debe adjuntar el correo de confirmación del departamento de sostenibilidad",
          (value) => value !== null && value !== undefined
        )
    }) as any,

  // Conditional validations for Outsourcing (Tercerización)
  motivoTercerizacion: yup
    .string()
    .default("")
    .when("tipoAprobacion", {
      is: "tercerizacion",
      then: (schema) => schema.required("Debe seleccionar el motivo de tercerización")
    }),

  existenProveedoresZona: yup
    .string()
    .default("")
    .when("tipoAprobacion", {
      is: "tercerizacion",
      then: (schema) => schema.required("Debe indicar si existen proveedores en la zona")
    }),

  proveedorSinDisponibilidad: yup
    .string()
    .default("")
    .when(["tipoAprobacion", "existenProveedoresZona"], {
      is: (tipo: string, existen: string) => tipo === "tercerizacion" && existen === "si",
      then: (schema) =>
        schema.required("Debe seleccionar el proveedor local que no presentó disponibilidad")
    }),

  aseguroHabilitar: yup
    .boolean()
    .default(false)
    .when("tipoAprobacion", {
      is: "tercerizacion",
      then: (schema) =>
        schema.test(
          "is-true",
          "Debe confirmar que habilitará como subcontratista ante Halliburton",
          (value) => value === true
        )
    }),

  // Complex data validations
  forecastItems: yup
    .array()
    .of(
      yup.object().shape({
        id: yup.string().required().default(""),
        cantidadUsos: yup
          .number()
          .required()
          .min(1, "La cantidad de usos debe ser mayor a 0")
          .default(0)
      })
    )
    .min(1, "Debe tener al menos una tarifa en el forecast")
    .required()
    .default([]),

  approvers: yup
    .array()
    .of(
      yup.object().shape({
        id: yup.string().required().default(""),
        name: yup.string().required("Debe seleccionar un aprobador").default(""),
        email: yup.string().email("Email inválido").required("Email requerido").default("")
      })
    )
    .min(1, "Debe agregar al menos un aprobador")
    .test("has-valid-approver", "Debe seleccionar al menos un aprobador válido", (approvers) => {
      if (!approvers || approvers.length === 0) return false;
      return approvers.some((approver) => approver.name && approver.email);
    })
    .required()
    .default([{ id: "1", name: "", email: "" }]),

  comparisonRates: yup
    .object()
    .default({})
    .test(
      "comparison-rates-validation",
      "Para montos superiores a 25 mil USD, debe agregar tarifas comparativas o marcar como Single source",
      function (value) {
        const { forecastItems, isSingleSource } = this.parent;

        // Calculate grand total
        const grandTotal =
          forecastItems?.reduce((sum: number, item: any) => {
            return sum + item.tarifa * item.cantidadUsos;
          }, 0) || 0;

        // If total > 100,000,000 and not single source, validate comparison rates
        if (grandTotal > 100000000 && !isSingleSource) {
          const hasAllComparisons = forecastItems?.every((item: any) => {
            const comparisons = (value as any)?.[item.id] || [];
            return comparisons.length > 0;
          });

          return hasAllComparisons || false;
        }

        return true;
      }
    )
});
