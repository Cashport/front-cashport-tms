import React, { FC, useEffect, useState } from "react";
import { Button, Flex, message } from "antd";
import {
  ITransferOrderRequestContacts,
  ITransferRequestCreation,
  ITransferRequestJourneyInfo
} from "@/types/logistics/schema";
import { getTransferRequestVehicles, submitTrips } from "@/services/logistics/transfer-request";
import Trip from "../components/trip/Trip";
import { useFieldArray, useForm } from "react-hook-form";
import useSWR from "swr";
import JourneyCollapse from "../components/journeyCollapse/JourneyCollapse";

interface VehiclesSelectionProps {
  transferRequest: ITransferRequestCreation | undefined;
  index: number;
  id_journey: number;
  start_location_desc: string;
  end_location_desc: string;
  id_type_service: number;
  journey: ITransferRequestJourneyInfo;
  setIsNextStepActive: React.Dispatch<React.SetStateAction<boolean>>;
  is_community?: 0 | 1;
  community_name?: string;
}

const VehiclesSelection: FC<VehiclesSelectionProps> = ({
  transferRequest,
  index,
  id_journey,
  start_location_desc,
  end_location_desc,
  id_type_service,
  journey,
  setIsNextStepActive,
  is_community = 0,
  community_name
}) => {
  const { data, isLoading: isLoadingVehicles } = useSWR(
    { id_journey },
    ({ id_journey }) => getTransferRequestVehicles(id_journey),
    { revalidateOnMount: true, revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  const sugestedVehicles = data?.vehiclesPricing;
  const trips = data?.trips;

  useEffect(() => {
    reset({
      trips: trips?.map((s) => ({
        id: s.id,
        id_vehicle_type: s.id_vehicle_type,
        materialByTrip:
          s.material?.map((m) => ({
            id_material: m.id_material,
            units: m.units
          })) || [],
        personByTrip:
          s.persons?.map((p) => ({ id_person_transfer_request: p.id_person_transfer_request })) ||
          []
      }))
    });
  }, [sugestedVehicles]);

  const { handleSubmit, control, reset, formState } = useForm({
    defaultValues: {
      trips: journey.trips.map((t) => ({
        id: t.id,
        id_vehicle_type: t.id_vehicle_type,
        materialByTrip:
          t?.material?.map((m) => ({
            id_material: m.id_material,
            units: m.units
          })) || [],
        personByTrip:
          t?.persons?.map((p) => ({ id_person_transfer_request: p.id_person_transfer_request })) ||
          []
      }))
    }
  });
  const { fields, append, remove, update } = useFieldArray({
    control,
    keyName: "_id",
    name: "trips"
  });
  useEffect(() => {
    setIsNextStepActive(!formState.dirtyFields?.trips?.length && !!fields.length);
    console.log(fields.length, formState.isDirty);
  }, [fields, formState.dirtyFields?.trips]);
  const [openTabs, setOpenTabs] = useState<number[]>([index]);

  const addVehiclesSections = () => {
    append({ id: 0, id_vehicle_type: 0, materialByTrip: [], personByTrip: [] });
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
        ],
        personByTrip: []
      });
    } else {
      update(index, {
        id: fields[index].id,
        id_vehicle_type: fields[index].id_vehicle_type,
        materialByTrip: [...fields[index].materialByTrip, { id_material, units: 1 }],
        personByTrip: []
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
          materialByTrip: fields[index].materialByTrip.filter((m) => m.id_material !== id_material),
          personByTrip: []
        });
      } else {
        update(index, {
          id: fields[index].id,
          id_vehicle_type: fields[index].id_vehicle_type,
          materialByTrip: fields[index].materialByTrip.map((m) =>
            m.id_material === id_material ? { ...m, units: m.units - 1 } : m
          ),
          personByTrip: []
        });
      }
    }
  };

  const handleSelectPerson = (index: number, selectedPersons: ITransferOrderRequestContacts[]) => {
    const persons = transferRequest?.stepOne?.transferRequest?.flatMap(
      (a) => a.transfer_request_persons || []
    );
    update(index, {
      id: fields[index].id,
      id_vehicle_type: fields[index].id_vehicle_type,
      personByTrip:
        persons
          ?.map((p) => ({
            id_person_transfer_request:
              selectedPersons.find(
                (s) =>
                  s.id === p.id &&
                  !fields.some(
                    (f, i) =>
                      i !== index &&
                      f.personByTrip.some((fp) => fp.id_person_transfer_request === s.id)
                  )
              )?.id || 0
          }))
          .filter((p) => p.id_person_transfer_request) || [],
      materialByTrip: []
    });
  };

  const handleSelectVehicle = (index: number, id_vehicle_type: number) => {
    update(index, {
      id: fields[index].id,
      id_vehicle_type,
      materialByTrip: fields[index].materialByTrip,
      personByTrip: fields[index].personByTrip
    });
  };

  const handleSave = async (data: any) => {
    try {
      if (fields.length === 0) {
        message.error("Debe agregar al menos una sección de vehículos");
        return;
      }
      const res = await submitTrips(journey.id_transfer_request, journey.id, data.trips);
      reset({
        trips: res.map((t) => ({
          id: t.id,
          id_vehicle_type: t.id_vehicle_type,
          materialByTrip:
            t.material?.map((m) => ({
              id_material: m.id_material,
              units: m.units
            })) || [],
          personByTrip:
            t.persons?.map((p) => ({ id_person_transfer_request: p.id_person_transfer_request })) ||
            []
        }))
      });
    } catch (error) {
      console.error(error);
    }
  };

  const tag = (
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
          handleSelectPerson={(id: any) => handleSelectPerson(index, id)}
          section={section}
        />
      ))}
      <div className="collapseButtons">
        <Button
          className="collapseAddVehicleButton"
          onClick={addVehiclesSections}
          loading={isLoadingVehicles}
        >
          Agregar vehículo
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
      tag={tag}
      openTabs={openTabs}
      setOpenTabs={setOpenTabs}
      is_community={is_community}
      community_name={community_name}
    />
  );
};

export default VehiclesSelection;
