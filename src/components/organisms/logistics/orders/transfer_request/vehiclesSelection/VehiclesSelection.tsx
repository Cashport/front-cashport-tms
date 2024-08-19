import React, { FC, useEffect, useState } from "react";
import { CaretDown, Circle, CraneTower, Truck, User } from "@phosphor-icons/react";
import { Button, Collapse, CollapseProps, Flex, Typography } from "antd";
import {
  ITransferRequestCreation,
  ITransferRequestJourneyInfo,
  IVehiclesPricing
} from "@/types/logistics/schema";
import { formatMoney } from "@/utils/utils";
import { getTransferRequestVehicles, submitTrips } from "@/services/logistics/transfer-request";
import Trip from "../components/trip/Trip";
import { useFieldArray, useForm } from "react-hook-form";
import useSWR from "swr";
import TitleComponent from "../components/titles/JourneyTitle";
import JourneyCollapse from "../components/journeyCollapse/JourneyCollapse";

interface VehiclesSelectionProps {
  transferRequest: ITransferRequestCreation | undefined;
  index: number;
  id_journey: number;
  start_location_desc: string;
  end_location_desc: string;
  id_type_service: number;
  journey: ITransferRequestJourneyInfo;
}

const { Text } = Typography;

const VehiclesSelection: FC<VehiclesSelectionProps> = ({
  transferRequest,
  index,
  id_journey,
  start_location_desc,
  end_location_desc,
  id_type_service,
  journey
}) => {
  const { data: sugestedVehicles, isLoading: isLoadingVehicles } = useSWR(
    { id_journey },
    ({ id_journey }) => getTransferRequestVehicles(id_journey)
  );

  const { register, handleSubmit, watch, control, reset, formState } = useForm({
    defaultValues: {
      trips: journey.trips.map((t) => ({
        id: t.id,
        id_vehicle_type: t.id_vehicle_type,
        materialByTrip: t.material.map((m) => ({
          id_material: m.id_material,
          units: m.units
        }))
      }))
    }
  });
  const { fields, append, remove, update } = useFieldArray({
    control,
    keyName: "_id",
    name: "trips"
  });
  const [openTabs, setOpenTabs] = useState<number[]>([]);

  const addVehiclesSections = () => {
    append({ id: 0, id_vehicle_type: 0, materialByTrip: [] });
  };

  const handleAddMaterialByTrip = (index: number, id_material: number) => {
    const exist = fields[index].materialByTrip.find((m) => m.id_material === id_material);
    console.log(
      exist,
      fields[index].materialByTrip.find((m) => m.id_material === id_material)
    );
    if (exist) {
      update(index, {
        id: fields[index].id,
        id_vehicle_type: fields[index].id_vehicle_type,
        materialByTrip: [
          ...fields[index].materialByTrip.filter((m) => m.id_material !== id_material),
          {
            id_material,
            units:
              (fields[index].materialByTrip.find((m) => m.id_material === id_material)?.units ||
                0) + 1
          }
        ]
      });
    } else {
      update(index, {
        id: fields[index].id,
        id_vehicle_type: fields[index].id_vehicle_type,
        materialByTrip: [...fields[index].materialByTrip, { id_material, units: 1 }]
      });
    }
  };

  const handleRemoveMaterialByTrip = (index: number, id_material: number) => {
    const exist = fields[index].materialByTrip.find((m) => m.id_material === id_material);
    if (exist) {
      if (exist.units === 1) {
        update(index, {
          id: fields[index].id,
          id_vehicle_type: fields[index].id_vehicle_type,
          materialByTrip: fields[index].materialByTrip.filter((m) => m.id_material !== id_material)
        });
      } else {
        update(index, {
          id: fields[index].id,
          id_vehicle_type: fields[index].id_vehicle_type,
          materialByTrip: fields[index].materialByTrip.map((m) =>
            m.id_material === id_material ? { ...m, units: m.units - 1 } : m
          )
        });
      }
    }
  };

  const handleSelectVehicle = (index: number, id_vehicle_type: number) => {
    update(index, {
      id: fields[index].id,
      id_vehicle_type,
      materialByTrip: fields[index].materialByTrip
    });
  };

  const handleSave = async (data: any) => {
    console.log(data);
    try {
      const res = await submitTrips(journey.id_transfer_request, journey.id, data.trips);
      reset({
        trips: res.map((t) => ({
          id: t.id,
          id_vehicle_type: t.id_vehicle_type,
          materialByTrip: t.material.map((m) => ({
            id_material: m.id_material,
            units: m.units
          }))
        }))
      });
    } catch (error) {
      console.error(error);
    }
  };

  const tags = (
    <div className="collapseInformationWrapper">
      {fields.map((section, index) => (
        <Trip
          key={`Trip-${index}`}
          transferRequest={transferRequest}
          index={index}
          id_journey={id_journey}
          id_type_service={id_type_service}
          onRemove={() => remove(index)}
          sugestedVehicles={sugestedVehicles}
          isLoadingVehicles={isLoadingVehicles}
          handleAddMaterialByTrip={(id_material: number) =>
            handleAddMaterialByTrip(index, id_material)
          }
          handleRemoveMaterialByTrip={(id_material: number) =>
            handleRemoveMaterialByTrip(index, id_material)
          }
          handleSelectVehicle={(id_vehicle_type: number) =>
            handleSelectVehicle(index, id_vehicle_type)
          }
          section={section}
        />
      ))}
      <div className="collapseButtons">
        <Button className="collapseAddVehicleButton" onClick={addVehiclesSections}>
          Agregar vehíchulo
        </Button>
        <Flex gap={5}>
          {formState.dirtyFields?.trips?.length && (
            <Button
              loading={formState.isSubmitting}
              onClick={() => reset()}
              className="collapseCancelButton"
            >
              Cancelar
            </Button>
          )}

          <Button
            className="collapseSaveButton"
            loading={formState.isSubmitting}
            disabled={!formState.dirtyFields?.trips?.length}
            onClick={handleSubmit(handleSave)}
          >
            Guardar
          </Button>
        </Flex>
      </div>
    </div>
  );

  return (
    <JourneyCollapse
      index={index}
      id_type_service={id_type_service}
      start_location_desc={start_location_desc}
      end_location_desc={end_location_desc}
      tags={tags}
      openTabs={openTabs}
      setOpenTabs={setOpenTabs}
    />
  );
};

export default VehiclesSelection;
