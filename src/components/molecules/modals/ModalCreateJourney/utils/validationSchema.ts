import * as yup from "yup";

export const journeySchema = yup.object().shape({
  id: yup.number().nullable().notRequired(),
  order_to: yup.number().nullable(),
  typeActive: yup.string().nullable().required("El tipo de viaje es obligatorio"),
  origin: yup
    .object()
    .shape({
      description: yup.string().required("La descripción de origen es obligatoria"),
      id: yup.number().nullable(),
      coordinates: yup
        .array()
        .of(yup.number())
        .nullable()
        .required("Las coordenadas de origen son obligatorias")
    })
    .nullable()
    .required("El origen es obligatorio"),
  destination: yup
    .object()
    .shape({
      description: yup.string().required("La descripción de destino es obligatoria"),
      id: yup.number().nullable(),
      coordinates: yup
        .array()
        .of(yup.number())
        .nullable()
        .required("Las coordenadas de destino son obligatorias")
    })
    .nullable()
    .required("El destino es obligatorio"),
  route: yup
    .array()
    .of(
      yup.object().shape({
        distance: yup.number().notRequired(),
        duration: yup.number().notRequired(),
        geometry: yup.object().shape({
          type: yup.string().oneOf(["LineString"]).notRequired(),
          coordinates: yup.array().of(yup.array().of(yup.number()).length(2)).notRequired()
        })
      })
    )
    .notRequired(),
  needLiftingOrigin: yup.boolean().required(),
  timeLiftingInOrigin: yup
    .number()
    .min(0, "El tiempo de izaje debe ser mayor o igual a 0")
    .required(),
  needLiftingDestination: yup.boolean().required(),
  startDate: yup.date().nullable().required("La fecha de inicio es obligatoria"),
  startTime: yup.date().nullable().required("La hora de inicio es obligatoria"),
  endDate: yup.date().nullable().required("La fecha de fin es obligatoria"),
  endTime: yup.date().nullable().required("La hora de fin es obligatoria"),
  startTimeFlexible: yup.number().notRequired(),
  endTimeFlexible: yup.number().notRequired(),
  community_name: yup.string().notRequired(),
  is_community: yup.number().notRequired()
});
