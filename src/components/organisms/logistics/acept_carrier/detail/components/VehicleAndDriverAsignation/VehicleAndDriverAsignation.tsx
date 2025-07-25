"use client";
import React, { useEffect, Dispatch, SetStateAction, forwardRef, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import Link from "next/link";
import dayjs from "dayjs";
import { Flex, Select, Tag } from "antd";
import { Circle } from "phosphor-react";

import DriverRenderOption from "./components/DriverRenderOption/DriverRenderOption";
import DriverRenderLabel from "./components/DriverRenderLabel/DriverRenderLabel";
import VehicleRenderOption from "./components/VehicleRenderOption/VehicleRenderOption";
import VehicleRenderLabel from "./components/VehicleRenderLabel/VehicleRenderLabel";
import AddRemoveButton from "./components/AddRemoveButton/AddRemoveButton";
import ModalDocuments from "@/components/molecules/modals/ModalDocuments/ModalDocuments";
import { documentsTypes } from "../../mockdata";
import { FormMode } from "../../../view/AceptCarrierDetailView/AceptCarrierDetailView";
import Buttons from "../Buttons/Buttons";

import { ICarrierRequestDrivers, ICarrierRequestVehicles } from "@/types/logistics/schema";
import { DocumentCompleteType } from "@/types/logistics/certificate/certificate";
import { IAceptCarrierAPI } from "@/types/logistics/carrier/carrier";

import styles from "./vehicleAndDriverAsignation.module.scss";

const { Option } = Select;

interface VehicleAndDriverAsignationProps {
  setVehicle: Dispatch<SetStateAction<number | null>>;
  setDrivers: Dispatch<SetStateAction<(number | null)[]>>;
  drivers: ICarrierRequestDrivers[] | null | undefined;
  vehicles: ICarrierRequestVehicles[] | null | undefined;
  currentDrivers: (number | null)[];
  currentVehicle: number | null;
  formMode: FormMode;
  setView: Dispatch<SetStateAction<"detail" | "asignation" | "confirmation">>;
  carrier: IAceptCarrierAPI | undefined;
  handleReject: () => Promise<void>;
  showRejectButton: boolean;
}
interface FormValues {
  vehicleForm: number | null;
  driverForm: { driverId: number | null }[];
}

const VehicleAndDriverAsignation = forwardRef(function VehicleAndDriverAsignation({
  drivers,
  vehicles,
  setVehicle,
  setDrivers,
  currentDrivers,
  currentVehicle,
  carrier,
  formMode,
  setView,
  handleReject,
  showRejectButton
}: VehicleAndDriverAsignationProps) {
  const [canEditVehicle, setCanEditVehicle] = useState<boolean>(formMode === FormMode.CREATE);
  const [canEditDrivers, setCanEditDrivers] = useState<boolean>(formMode === FormMode.CREATE);
  const [isFormCompleted, setIsFormCompleted] = useState<boolean>(false);

  const handleVehicleSelect = () => {
    if (formMode === FormMode.EDIT) {
      setCanEditVehicle(true);
    }
  };
  const handleDriverSelect = () => {
    if (formMode === FormMode.EDIT) {
      setCanEditDrivers(true);
    }
  };
  const createDefault = () => {
    const defaultDrivers = currentDrivers.length
      ? currentDrivers.map((cd) => ({ driverId: cd }))
      : [{ driverId: null }];
    return defaultDrivers;
  };
  const { control, watch, register, getValues } = useForm<FormValues>({
    defaultValues: {
      vehicleForm: currentVehicle ?? null,
      driverForm: createDefault()
    }
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "driverForm"
  });
  const selectedVehicle = watch("vehicleForm");
  const selectedDrivers = watch("driverForm");

  // only verified vehicles and drivers are valid
  const VALID_STATUS = "707bc5c2-5e8b-4a38-9cee-fcfec914a1a4";

  const formCurrentValues = getValues();

  const DRIVERS_MAX_QUANTITY = 5;
  const [isOpenModalDocuments, setIsOpenModalDocuments] = useState<boolean>(false);

  const isContinueButtonEnabled = () => {
    if (formMode === FormMode.CREATE && !isFormCompleted) return false;
    if (formMode === FormMode.EDIT && !isFormCompleted) return false;
    else return true;
  };

  useEffect(() => {
    const { vehicleForm, driverForm } = formCurrentValues;
    if (vehicleForm && driverForm[0].driverId !== null) {
      setIsFormCompleted(true);
    }
  }, [formCurrentValues]);

  const onSubmit = (data: FormValues) => {
    const { vehicleForm, driverForm } = data;
    vehicleForm && setVehicle(vehicleForm);
    const driversIdsArray = driverForm
      .map((d) => d.driverId ?? null)
      .filter((driverId) => driverId !== null && driverId !== undefined);
    setDrivers(driversIdsArray);
  };

  function filterDrivers(indexField: number) {
    const selectedDriverIds = selectedDrivers
      .map((driver) => driver.driverId)
      .filter((id) => id !== null);
    return drivers?.filter(
      (driver) =>
        !selectedDriverIds.includes(driver.id) ||
        driver.id === selectedDrivers[indexField]?.driverId
    );
  }

  const [selectedFiles, setSelectedFiles] = useState<DocumentCompleteType[]>([]);
  useEffect(() => {
    const docsWithLink =
      documentsTypes
        .filter((docs) => !docs.optional)
        .map((dt, index) => ({
          ...dt,
          key: index,
          file: undefined,
          link: undefined,
          expirationDate: dayjs()
        })) || [];
    setSelectedFiles(docsWithLink);
  }, [documentsTypes]);

  // Función helper para obtener el status del vehículo seleccionado
  const getVehicleStatus = () => {
    if (!selectedVehicle || !vehicles) return null;
    const vehicle = vehicles.find((v) => v.id === selectedVehicle);
    return vehicle?.status;
  };

  // Función helper para obtener el status del conductor seleccionado
  const getDriverStatus = (driverId: number | null) => {
    if (!driverId || !drivers) return null;
    const driver = drivers.find((d) => d.id === driverId);
    return driver?.status;
  };

  return (
    <div>
      <div className={styles.wrapper}>
        <Flex justify="space-between">
          <p className={styles.sectionTitle}>Vehículo</p>
          {formMode === FormMode.EDIT && !canEditVehicle && (
            <AddRemoveButton type="edit" onClick={handleVehicleSelect} text="Editar vehículo" />
          )}
        </Flex>
        <div className={styles.container} style={{ gap: "6px" }}>
          <p className={styles.subtitle}>Seleccione el vehículo</p>
          <Flex vertical gap={"1rem"}>
            <Flex gap={"0.625rem"} align="center">
              <Controller
                {...register(`vehicleForm`)}
                control={control}
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      disabled={!canEditVehicle}
                      showSearch
                      placeholder="Seleccione el vehículo"
                      style={{ width: "33rem", height: "2.5rem" }}
                      optionLabelProp="label"
                      labelRender={(selectedValue) => (
                        <VehicleRenderLabel vehicles={vehicles} selectedValue={selectedValue} />
                      )}
                      optionFilterProp="label"
                      filterOption={(input: string, option: any) => {
                        if (option) {
                          return option.label?.toLowerCase().includes(input.toLowerCase());
                        }
                        return false;
                      }}
                      popupMatchSelectWidth={false}
                    >
                      {vehicles?.map((vehicle, index) => (
                        <Option
                          key={`option-vehicle-${vehicle.id}-${index}`}
                          value={vehicle.id}
                          label={`${vehicle.vehicle_type} ${vehicle.brand} ${vehicle.line} ${vehicle.color} ${vehicle.plate_number}`}
                          style={{ borderTop: index !== 0 ? "1px solid #f7f7f7" : "none" }}
                        >
                          <VehicleRenderOption data={vehicle} selectedVehicle={selectedVehicle} />
                        </Option>
                      ))}
                    </Select>
                  );
                }}
              />

              {getVehicleStatus() && (
                <Tag
                  icon={<Circle color={getVehicleStatus()?.color} weight="fill" size={6} />}
                  style={{
                    backgroundColor: getVehicleStatus()?.backgroundColor || " #F7F7F7",
                    color: getVehicleStatus()?.color
                  }}
                  className={styles.tag}
                >
                  {getVehicleStatus()?.description || getVehicleStatus()?.name}
                </Tag>
              )}
            </Flex>

            {getVehicleStatus() && getVehicleStatus()?.id !== VALID_STATUS && (
              <p>
                El vehículo no se puede seleccionar para este viaje por documentación incompleta.{" "}
                <Link
                  href={`/logistics/providers/${carrier?.id_carrier}/vehicle/${selectedVehicle}`}
                  target="_blank"
                >
                  Ir a corregir documentación.
                </Link>
              </p>
            )}
          </Flex>
        </div>
        {fields.map((field, indexField: number) => (
          <div key={`field-${field.id}-${indexField}`}>
            <hr style={{ borderTop: "1px solid #dddddd" }}></hr>
            <Flex style={{ width: "100%" }} justify="space-between">
              <Flex justify="space-between">
                <p className={styles.sectionTitle} style={{ marginTop: "2rem" }}>
                  Conductor {indexField !== 0 && indexField + 1}
                </p>
              </Flex>
              {fields.length > 1 && (
                <AddRemoveButton
                  type="remove"
                  onClick={() => remove(indexField)}
                  disabled={formMode !== FormMode.CREATE && !canEditDrivers}
                />
              )}
              {formMode === FormMode.EDIT && !canEditDrivers && (
                <AddRemoveButton type="edit" onClick={handleDriverSelect} text="Editar conductor" />
              )}
            </Flex>
            <div className={styles.container}>
              <p className={styles.subtitle}>Seleccione el conductor</p>
              <div className={styles.selector}>
                <Flex vertical gap={"1rem"}>
                  <Flex gap={"0.5rem"} align="center">
                    <Controller
                      {...register(`driverForm.${indexField}.driverId`)}
                      control={control}
                      render={({ field }) => {
                        return (
                          <Select
                            {...field}
                            disabled={!canEditDrivers}
                            showSearch
                            placeholder="Seleccione el conductor"
                            style={{ width: "33rem", height: "2.5rem" }}
                            optionLabelProp="label"
                            labelRender={(selectedValue) => (
                              <DriverRenderLabel selectedValue={selectedValue} drivers={drivers} />
                            )}
                            optionFilterProp="label"
                            filterOption={(input: string, option: any) => {
                              if (option) {
                                return option.label?.toLowerCase().includes(input.toLowerCase());
                              }
                              return false;
                            }}
                            popupMatchSelectWidth={false}
                          >
                            {filterDrivers(indexField)?.map((driver, index) => (
                              <Option
                                key={`option-driver-${driver.id}-${index}`}
                                value={driver.id}
                                label={`${driver.name} ${driver.last_name} ${driver.phone}`}
                                style={{ borderTop: index !== 0 ? "1px solid #f7f7f7" : "none" }}
                              >
                                <DriverRenderOption
                                  selectedDrivers={selectedDrivers}
                                  data={driver}
                                  selectIndex={indexField}
                                />
                              </Option>
                            ))}
                          </Select>
                        );
                      }}
                    />

                    {getDriverStatus(selectedDrivers[indexField]?.driverId) && (
                      <Tag
                        icon={
                          <Circle
                            color={getDriverStatus(selectedDrivers[indexField]?.driverId)?.color}
                            weight="fill"
                            size={6}
                          />
                        }
                        style={{
                          backgroundColor:
                            getDriverStatus(selectedDrivers[indexField]?.driverId)
                              ?.backgroundColor || " #F7F7F7",
                          color: getDriverStatus(selectedDrivers[indexField]?.driverId)?.color
                        }}
                        className={styles.tag}
                      >
                        {getDriverStatus(selectedDrivers[indexField]?.driverId)?.description ||
                          getDriverStatus(selectedDrivers[indexField]?.driverId)?.name}
                      </Tag>
                    )}
                  </Flex>

                  {getDriverStatus(selectedDrivers[indexField]?.driverId) &&
                    getDriverStatus(selectedDrivers[indexField]?.driverId)?.id !== VALID_STATUS && (
                      <p>
                        El conductor no se puede seleccionar para este viaje por documentación
                        incompleta.{" "}
                        <Link
                          href={`/logistics/providers/${carrier?.id_carrier}/driver/${selectedDrivers[indexField]?.driverId}`}
                          target="_blank"
                        >
                          Ir a corregir documentación.
                        </Link>
                      </p>
                    )}
                </Flex>

                {indexField === fields.length - 1 && (
                  <AddRemoveButton
                    type="add"
                    onClick={() => append({ driverId: null })}
                    disabled={fields.length === DRIVERS_MAX_QUANTITY || !canEditDrivers}
                    text="Agregar otro conductor"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
        <ModalDocuments
          isOpen={isOpenModalDocuments}
          mockFiles={selectedFiles}
          setFiles={() => {}}
          documentsType={documentsTypes}
          isLoadingDocuments={false}
          onClose={() => setIsOpenModalDocuments(false)}
          handleChange={() => {}}
          handleChangeExpirationDate={() => {}}
          setSelectedFiles={() => {}}
        />
      </div>
      <Buttons
        canContinue={true}
        isRightButtonActive={isContinueButtonEnabled()}
        isLeftButtonActive={true}
        handleNext={() => {
          onSubmit(formCurrentValues);
          setView("confirmation");
        }}
        handleBack={() => setView("detail")}
        handleReject={handleReject}
        isLastStep={false}
        showRejectButton={showRejectButton}
      />
    </div>
  );
});

VehicleAndDriverAsignation.displayName = "VehicleAndDriverAsignation";

export default VehicleAndDriverAsignation;
