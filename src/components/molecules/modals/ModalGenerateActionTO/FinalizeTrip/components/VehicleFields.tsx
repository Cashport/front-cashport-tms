import { useFieldArray } from "react-hook-form";
import styles from "../FinalizeTrip.module.scss";
import { DocumentFields } from "./DocumentsFields";
import { FinalizeTripForm, ICarrier } from "../controllers/finalizetrip.types";
import { Flex } from "antd";

export function VehicleFields({
  control,
  register,
  selectedTab,
  handleOnDeleteDocument,
  handleOnChangeDocument,
  currentCarrier,
  disabled = false
}: Readonly<{
  control: any;
  register: any;
  selectedTab: number;
  handleOnDeleteDocument: (vehicleIndex: number, documentIndex: number, entityType: "trip" | "requirement") => void;
  handleOnChangeDocument: (fileToSave: any, vehicleIndex: number, documentIndex: number, entityType: "trip" | "requirement") => void;
  currentCarrier: ICarrier;
  disabled?: boolean;
}>) {
  const { fields: vehicleFields } = useFieldArray<FinalizeTripForm>({
    control,
    name: `carriers.${selectedTab}.vehicles`
  });
  const { fields: requirementsFields } = useFieldArray<FinalizeTripForm>({
    control,
    name: `carriers.${selectedTab}.requirements`
  });

  return (
    <Flex vertical>
      {vehicleFields.map((vehicle: any, vehicleIndex) => (
        <Flex vertical key={`carrier-${selectedTab}-vehicle-${vehicleIndex}`}>
          <p className={styles.vehicleName}>Vehículo {vehicle.plate}</p>
          <DocumentFields
            control={control}
            register={register}
            carrierIndex={selectedTab}
            entityIndex={vehicleIndex}
            entityType="trip"
            handleOnChangeDocument={handleOnChangeDocument}
            handleOnDeleteDocument={handleOnDeleteDocument}
            currentCarrier={currentCarrier}
            disabled={disabled}
          />
        </Flex>
      ))}
      {requirementsFields.map((requirement: any, requirementIndex) => (
        <Flex vertical key={`carrier-${selectedTab}-requerimento-${requirementIndex}`}>
          <p className={styles.vehicleName}>Requerimiento adicional: {requirement.description}</p>
          <DocumentFields
            control={control}
            register={register}
            carrierIndex={selectedTab}
            entityIndex={requirementIndex}
            entityType="requirement"
            handleOnChangeDocument={handleOnChangeDocument}
            handleOnDeleteDocument={handleOnDeleteDocument}
            currentCarrier={currentCarrier}
            disabled={disabled}
          />
        </Flex>
      ))}
    </Flex>
  );
}
