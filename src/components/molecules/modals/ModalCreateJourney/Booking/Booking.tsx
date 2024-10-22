import { DatePicker, Flex, Select, Switch, TimePicker, Typography } from "antd";
import { useEffect, useState } from "react";
import styles from "./Booking.module.scss";
import { FooterButtons } from "../components/FooterButtons/FooterButtons";
import { FormMode, Journey, JourneyFormValues, OPTIONS_FLEXBILE, typeOfTrip } from "../utils/types";
import {
  Control,
  Controller,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch
} from "react-hook-form";
import FormWizard from "react-form-wizard-component";
import useMapboxDirections from "../utils/useMapBoxDirections";
import MapInfoContainer from "../components/MapInfoContainer/MapInfoContainer";
import CustomTimeSelector from "@/components/molecules/logistics/HourPicker/HourPicker";

// dayjs locale
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import { useLocations } from "../utils/useLocations";
dayjs.locale("es");
dayjs.extend(utc);
dayjs.extend(tz);

const { Text } = Typography;

type TypeOfTripProps = {
  handleBack: () => void;
  handleNext: () => void;
  typeActive: typeOfTrip | null;
  selectedTrip?: Journey;
  register: UseFormRegister<JourneyFormValues>;
  watch: UseFormWatch<JourneyFormValues>;
  control: Control<JourneyFormValues, any>;
  setValue: UseFormSetValue<JourneyFormValues>;
  isValid: boolean;
  formMode: FormMode;
  isLoadingSubmit: boolean;
};

const Booking = ({
  handleBack,
  handleNext,
  typeActive,
  selectedTrip,
  register,
  control,
  setValue,
  watch,
  isValid,
  formMode,
  isLoadingSubmit
}: TypeOfTripProps) => {
  const { locations, locationOptions } = useLocations();

  const needLiftingOrigin = watch("needLiftingOrigin");
  const timeLiftingInOrigin = watch("timeLiftingInOrigin");

  const startTimeFlexible = watch("startTimeFlexible");
  const startTime = watch("startTime");

  const startDate = watch("startDate");
  const origin = watch("origin");
  const destination = watch("destination");

  console.log("origin", origin);
  console.log("destination", destination);

  const { distance, duration, timeTravel, route } = useMapboxDirections(
    origin?.coordinates,
    destination?.coordinates
  );

  const setLocationInfo = (type: "origin" | "destination", locationId: any) => {
    const findedLocation = locations?.find((l) => l.id === locationId);
    if (findedLocation) {
      setValue(`${type}.description`, findedLocation.description);
      setValue(`${type}.coordinates`, [findedLocation.longitude, findedLocation.latitude], {
        shouldValidate: true,
        shouldDirty: true
      });
    }
  };

  useEffect(() => {
    if (origin?.id && locations?.length) {
      setLocationInfo("origin", origin?.id);
    }
  }, [origin?.id, locations]);

  useEffect(() => {
    if (destination?.id && locations?.length) {
      setLocationInfo("destination", destination?.id);
    }
  }, [destination?.id, locations]);

  useEffect(() => {
    if (!startDate || !startTime) {
      setValue("endDate", null);
      setValue("endTime", null);
      return;
    }
    const initialHour = startTime.get("h");
    const initialMinute = startTime.get("m");

    let fechaFin = startDate.hour(initialHour).minute(initialMinute);

    console.log("FECHA FIN", fechaFin);

    if (typeActive === typeOfTrip.IZAJE) {
      fechaFin = fechaFin.add(timeLiftingInOrigin, "h");
    } else if (duration) {
      fechaFin = fechaFin.add(duration, "s");
    }
    setValue("endDate", fechaFin);
    setValue("endTime", fechaFin);
  }, [typeActive, startDate, startTime, timeLiftingInOrigin, duration]);

  useEffect(() => {
    if (startTimeFlexible !== null) setValue("endTimeFlexible", startTimeFlexible);
  }, [startTimeFlexible]);

  useEffect(() => {
    if (typeActive === typeOfTrip.IZAJE && origin?.id) {
      setValue("destination", origin, { shouldValidate: true, shouldDirty: true });
      setValue("needLiftingOrigin", true);
    }
  }, [typeActive, origin?.id]);

  useEffect(() => {
    setValue("route", route);
  }, [route]);

  return (
    <Flex vertical gap={24}>
      <FormWizard.TabContent title="Agendamiento" icon="ti-settings">
        <Flex gap={36}>
          <Flex vertical gap={16} style={{ flex: 1 }}>
            <Flex vertical gap={16}>
              <p className={styles.actionName}>Punto origen</p>
              <Controller
                name="origin"
                control={control}
                render={({ field }) => (
                  <Select
                    showSearch
                    placeholder="Buscar dirección inicial"
                    className={styles.select}
                    style={{ width: "100%" }}
                    onChange={(value, option: any) => {
                      field.onChange({ id: value, description: option.label });
                    }}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option!.children!.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    value={field.value?.description || watch("origin.description") || undefined}
                  >
                    {locationOptions.map(
                      (option: {
                        value: React.Key | null | undefined;
                        label: string | null | undefined;
                      }) => (
                        <Select.Option value={option.value} key={option.value}>
                          {option.label}
                        </Select.Option>
                      )
                    )}
                  </Select>
                )}
              />
              {typeActive === typeOfTrip.IZAJE && (
                <Flex justify="space-between" align="center">
                  <Flex gap={"0.5rem"}>
                    <Switch
                      checked={watch("needLiftingOrigin")}
                      onChange={(event) => {
                        setValue("needLiftingOrigin", event);
                      }}
                      disabled={typeActive === typeOfTrip.IZAJE}
                    />
                    <Text>Requiere Izaje</Text>
                  </Flex>
                  {needLiftingOrigin && (
                    <Flex gap={"0.5rem"} align="center" justify="end">
                      <Text>Horas</Text>
                      <Controller
                        name="timeLiftingInOrigin"
                        control={control}
                        defaultValue={0}
                        render={({ field }) => (
                          <CustomTimeSelector
                            initialValue={field.value}
                            onTimeChange={field.onChange}
                          />
                        )}
                      />
                    </Flex>
                  )}
                </Flex>
              )}
            </Flex>
            <Flex vertical gap={16}>
              <Flex vertical gap={8}>
                <p className={styles.actionName}>Fecha y hora inicial</p>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      placeholder="Seleccione fecha"
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                      value={field.value}
                      className={styles.select}
                    />
                  )}
                />
              </Flex>
              <Flex gap={24}>
                <Controller
                  name="startTime"
                  control={control}
                  render={({ field }) => (
                    <TimePicker
                      placeholder="Seleccione hora"
                      format={"HH:mm"}
                      minuteStep={15}
                      hourStep={1}
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                      value={field.value}
                      className={styles.select}
                      showNow={false}
                    />
                  )}
                />
                <Controller
                  name="startTimeFlexible"
                  control={control}
                  render={({ field }) => (
                    <Select
                      placeholder="Seleccione"
                      style={{ width: "100%" }}
                      options={OPTIONS_FLEXBILE}
                      onChange={(value) => {
                        field.onChange(value); // Actualiza el valor en react-hook-form
                        setValue("startTimeFlexible", value); // Actualiza el valor en el formulario si es necesario
                      }}
                      value={field.value} // Valor controlado por react-hook-form
                      className={styles.select}
                    />
                  )}
                />
              </Flex>
            </Flex>
          </Flex>
          <Flex vertical gap={16} style={{ flex: 1 }}>
            <Flex vertical gap={16}>
              <p className={styles.actionName}>Punto destino</p>
              <Controller
                name="destination"
                control={control}
                render={({ field }) => {
                  return (
                    <Select
                      showSearch
                      placeholder="Buscar dirección final"
                      className={styles.select}
                      style={{ width: "100%" }}
                      onChange={(value, option: any) => {
                        field.onChange({ id: value, description: option.label });
                      }}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option!.children!.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      value={
                        field.value?.description || watch("destination.description") || undefined
                      }
                      disabled={typeActive === typeOfTrip.IZAJE}
                    >
                      {locationOptions.map(
                        (option: {
                          value: React.Key | null | undefined;
                          label: string | null | undefined;
                        }) => (
                          <Select.Option value={option.value} key={option.value}>
                            {option.label}
                          </Select.Option>
                        )
                      )}
                    </Select>
                  );
                }}
              />
            </Flex>
            <Flex vertical gap={16}>
              <Flex vertical gap={8}>
                <p className={styles.actionName}>Fecha y hora final</p>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      placeholder="Seleccione fecha"
                      onChange={(value) => {
                        field.onChange(value);
                        setValue("endDate", value);
                      }}
                      value={field.value}
                      className={styles.select}
                      disabled={true}
                    />
                  )}
                />
              </Flex>
              <Flex gap={24}>
                <Controller
                  name="endTime"
                  control={control}
                  render={({ field }) => (
                    <TimePicker
                      placeholder="Seleccione hora"
                      format={"HH:mm"}
                      minuteStep={15}
                      hourStep={1}
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                      value={field.value}
                      className={styles.select}
                      showNow={false}
                      disabled={true}
                      needConfirm={false}
                    />
                  )}
                />
                <Controller
                  name="endTimeFlexible"
                  control={control}
                  render={({ field }) => (
                    <Select
                      placeholder="Seleccione"
                      style={{ width: "100%" }}
                      options={OPTIONS_FLEXBILE}
                      onChange={(value) => {
                        field.onChange(value);
                        setValue("endTimeFlexible", value);
                      }}
                      value={field.value}
                      className={styles.select}
                      disabled={true}
                    />
                  )}
                />
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </FormWizard.TabContent>
      {origin && destination && (
        <MapInfoContainer
          distance={distance ?? 0}
          timeTravel={
            typeActive === typeOfTrip.IZAJE ? `${timeLiftingInOrigin + " Hrs"}` : timeTravel
          }
          timeLabel={
            typeActive === typeOfTrip.IZAJE ? "Tiempo de izaje" : "Tiempo de desplazamiento"
          }
        />
      )}
      <FooterButtons
        backTitle="Cancelar"
        nextTitle={formMode === FormMode.CREATION ? "Crear trayecto" : "Editar trayecto"}
        handleBack={handleBack}
        handleNext={handleNext}
        nextDisabled={!isValid}
        isSubmitting={isLoadingSubmit}
      />
    </Flex>
  );
};

export default Booking;
