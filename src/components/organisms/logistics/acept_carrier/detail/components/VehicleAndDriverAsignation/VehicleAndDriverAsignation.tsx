"use client";
import React, { useEffect, Dispatch, SetStateAction, forwardRef, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Flex, Select } from "antd";
import { UploadDocumentButton } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import { ICarrierRequestDrivers, ICarrierRequestVehicles } from "@/types/logistics/schema";
import styles from "./vehicleAndDriverAsignation.module.scss";
import DriverRenderOption from "./components/DriverRenderOption/DriverRenderOption";
import DriverRenderLabel from "./components/DriverRenderLabel/DriverRenderLabel";
import VehicleRenderOption from "./components/VehicleRenderOption/VehicleRenderOption";
import VehicleRenderLabel from "./components/VehicleRenderLabel/VehicleRenderLabel";
import AddRemoveButton from "./components/AddRemoveButton/AddRemoveButton";
import EditDocsButton from "./components/EditDocsButton/EditDocsButton";
import ModalDocuments from "@/components/molecules/modals/ModalDocuments/ModalDocuments";
import { documentsTypes } from "../../mockdata";
import { DocumentCompleteType } from "@/types/logistics/certificate/certificate";
import dayjs from "dayjs";
import UploadDocumentChild from "@/components/atoms/UploadDocumentChild/UploadDocumentChild";
import { FormMode } from "../../../view/AceptCarrierDetailView/AceptCarrierDetailView";
import Buttons from "../Buttons/Buttons";
import { IAceptCarrierAPI } from "@/types/logistics/carrier/carrier";

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
  formMode,
  setView,
  carrier,
  handleReject,
  showRejectButton
}: VehicleAndDriverAsignationProps) {
  const MANDATORY_DRIVERS_DOCS = [7];
  const MANDATORY_VEHICLE_DOCS = [3, 4];

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
                  style={{ width: "25rem", height: "2.5rem" }}
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
                >
                  {vehicles?.map((vehicle, index) => (
                    <Option
                      key={`option-vehicle-${vehicle.id}-${index}`}
                      value={vehicle.id}
                      label={`${vehicle.vehicle_type} ${vehicle.brand} ${vehicle.line} ${vehicle.color} ${vehicle.plate_number}`}
                    >
                      <VehicleRenderOption
                        data={vehicle}
                        index={index}
                        selectedVehicle={selectedVehicle}
                      />
                    </Option>
                  ))}
                </Select>
              );
            }}
          />
          <div className={styles.documentsTop}>
            <p className={styles.subtitle}>Documentos del vehículo</p>
            <EditDocsButton
              onClick={() => setIsOpenModalDocuments(true)}
              text="Editar documentos"
              disabled={formMode !== FormMode.CREATE}
            />
          </div>
          <div className={styles.uploadContainer}>
            {selectedFiles
              .filter((sf) => MANDATORY_VEHICLE_DOCS.includes(sf.id))
              .map((file) => (
                <UploadDocumentButton
                  key={file.id}
                  title={file.description}
                  isMandatory={!file.optional}
                  aditionalData={file.id}
                  setFiles={() => {}}
                  files={file.file}
                  disabled
                  column
                >
                  {file?.link ? (
                    <UploadDocumentChild
                      linkFile={file.link}
                      nameFile={file.link.split("-").pop() ?? ""}
                      onDelete={() => {}}
                      showTrash={false}
                    />
                  ) : undefined}
                </UploadDocumentButton>
              ))}
          </div>
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
                        style={{ width: "25rem", height: "2.5rem" }}
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
                      >
                        {filterDrivers(indexField)?.map((driver, index) => (
                          <Option
                            key={`option-driver-${driver.id}-${index}`}
                            value={driver.id}
                            label={`${driver.name} ${driver.last_name} ${driver.phone}`}
                          >
                            <DriverRenderOption
                              selectedDrivers={selectedDrivers}
                              data={driver}
                              index={index}
                              selectIndex={indexField}
                            />
                          </Option>
                        ))}
                      </Select>
                    );
                  }}
                />
                {indexField === fields.length - 1 && (
                  <AddRemoveButton
                    type="add"
                    onClick={() => append({ driverId: null })}
                    disabled={fields.length === DRIVERS_MAX_QUANTITY || !canEditDrivers}
                    text="Agregar otro conductor"
                  />
                )}
              </div>
              <div className={styles.documentsTop}>
                <p className={styles.subtitle}>Documentos del conductor</p>
                <EditDocsButton
                  onClick={() => setIsOpenModalDocuments(true)}
                  text="Editar documentos"
                  disabled={formMode !== FormMode.CREATE}
                />
              </div>
              <div className={styles.uploadContainer}>
                {selectedFiles
                  .filter((sf) => MANDATORY_DRIVERS_DOCS.includes(sf.id))
                  .map((file) => (
                    <UploadDocumentButton
                      key={file.id}
                      title={file.description}
                      isMandatory={!file.optional}
                      aditionalData={file.id}
                      setFiles={() => {}}
                      files={file.file}
                      disabled
                      column
                    >
                      {file?.link ? (
                        <UploadDocumentChild
                          linkFile={file.link}
                          nameFile={file.link.split("-").pop() ?? ""}
                          onDelete={() => {}}
                          showTrash={false}
                        />
                      ) : undefined}
                    </UploadDocumentButton>
                  ))}
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
