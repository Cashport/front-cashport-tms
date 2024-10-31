import React, { FC, useEffect, useMemo, useState } from "react";
import { Button, Flex, message, Popconfirm, Table, TableProps, Typography } from "antd";
import {
  ITransferOrderRequestContacts,
  ITransferRequestCreation,
  ITransferRequestJourneyInfo
} from "@/types/logistics/schema";
import {
  getAditionalsRequirements,
  getTransferRequestVehicles,
  submitTrips
} from "@/services/logistics/transfer-request";
import Trip from "../components/trip/Trip";
import { useFieldArray, useForm } from "react-hook-form";
import useSWR from "swr";
import JourneyCollapse from "../components/journeyCollapse/JourneyCollapse";
import { CaretLeft, CaretRight, Trash, X } from "phosphor-react";
import { IRequirement, RequirementsAPI } from "@/types/logistics/trips/TripsSchema";
import AddRequirementModal, {
  RequirementOption
} from "@/components/molecules/modals/AddRequirementModal/AddRequirementModal";

const { Text } = Typography;

export interface SelectOption {
  value: number;
  label: string;
}
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

interface FormValues {
  trips: {
    id: number;
    id_vehicle_type: number;
    materialByTrip: {
      id_material: number;
      units: number;
    }[];
    personByTrip: {
      id_person_transfer_request: number;
    }[];
  }[];
  otherRequirements: IRequirement[];
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
      })),
      otherRequirements: []
    });
  }, [sugestedVehicles]);

  const { handleSubmit, control, reset, formState, watch } = useForm<FormValues>({
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
      })),
      otherRequirements: []
    }
  });

  const {
    fields: tripsFields,
    append: appendTrip,
    remove: removeTrip,
    update: updateTrip
  } = useFieldArray({
    control,
    keyName: "_id",
    name: "trips"
  });

  //    Otros requirimientos
  const [isModalAddRequirementOpen, setIsModalAddRequirementOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<SelectOption | null>(null);

  const { data: requirementsOptions, isLoading: isLoadingRequirements } = useSWR(
    "0",
    getAditionalsRequirements,
    { revalidateOnMount: true, revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const otherRequirementsOptions: RequirementOption[] = useMemo(() => {
    if (!requirementsOptions) return [];
    return requirementsOptions.map((req: RequirementsAPI) => ({
      value: req.id,
      label: req.description
    }));
  }, [requirementsOptions]);

  const {
    fields: otherRequirementsFields,
    append: appendRequirement,
    remove: removeRequirement,
    update: updateRequirement
  } = useFieldArray({
    control,
    name: "otherRequirements"
  });

  const requirements = watch("otherRequirements");

  const handleAddRequirement = (id_requirement: number) => {
    const existIndex = otherRequirementsFields.findIndex((m) => m.idRequirement === id_requirement);
    updateRequirement(existIndex, {
      ...otherRequirementsFields[existIndex],
      units: existIndex !== -1 ? otherRequirementsFields[existIndex].units + 1 : 1
    });
  };

  const handleRemoveRequirement = (id_requirement: number) => {
    const existIndex = otherRequirementsFields.findIndex((m) => m.idRequirement === id_requirement);
    if (existIndex !== -1) {
      if (otherRequirementsFields[existIndex].units === 1) {
        removeRequirement(existIndex);
      } else {
        updateRequirement(existIndex, {
          ...otherRequirementsFields[existIndex],
          units: otherRequirementsFields[existIndex].units - 1
        });
      }
    }
  };

  const handleDeleteRequirement = (id_requirement: number) => {
    const existIndex = otherRequirementsFields.findIndex((m) => m.idRequirement === id_requirement);
    existIndex !== -1 && removeRequirement(existIndex);
  };

  useEffect(() => {
    const hasTrips = !!tripsFields.length || !!otherRequirementsFields.length;
    const hasUnsavedChanges = Object.keys(formState.dirtyFields).length > 0;

    setIsNextStepActive(hasTrips && !hasUnsavedChanges);

    console.log(
      "Index",
      index,
      "tripsFields",
      tripsFields,
      "otherRequirementsFields",
      otherRequirementsFields
    );
    console.log("formState.dirtyFields", formState.dirtyFields);
  }, [tripsFields, otherRequirementsFields, formState.dirtyFields]);

  const [openTabs, setOpenTabs] = useState<number[]>([index]);

  const addVehiclesSections = () => {
    appendTrip({ id: 0, id_vehicle_type: 0, materialByTrip: [], personByTrip: [] });
  };

  const handleAddMaterialByTrip = (index: number, id_material: number) => {
    const trip = tripsFields[index];
    const exist = trip.materialByTrip?.find((m) => m.id_material === id_material);
    if (exist) {
      updateTrip(index, {
        ...trip,
        personByTrip: [],
        materialByTrip: [
          ...trip.materialByTrip.filter((m) => m.id_material !== id_material),
          {
            id_material,
            units: (trip.materialByTrip.find((m) => m.id_material === id_material)?.units || 0) + 1
          }
        ]
      });
    } else
      updateTrip(index, {
        ...trip,
        personByTrip: [],
        materialByTrip: [...trip.materialByTrip, { id_material, units: 1 }]
      });
  };

  const handleRemoveMaterialByTrip = (index: number, id_material: number) => {
    const trip = tripsFields[index];
    const exist = trip.materialByTrip?.find((m) => m.id_material === id_material);
    if (exist) {
      if (exist.units === 1) {
        updateTrip(index, {
          ...trip,
          personByTrip: [],
          materialByTrip: trip.materialByTrip?.filter((m) => m.id_material !== id_material)
        });
      } else
        updateTrip(index, {
          ...trip,
          personByTrip: [],
          materialByTrip: trip.materialByTrip?.map((m) =>
            m.id_material === id_material ? { ...m, units: m.units - 1 } : m
          )
        });
    }
  };

  const handleSelectPerson = (index: number, selectedPersons: ITransferOrderRequestContacts[]) => {
    const persons = transferRequest?.stepOne?.transferRequest?.flatMap(
      (a) => a.transfer_request_persons || []
    );
    updateTrip(index, {
      id: tripsFields[index].id,
      id_vehicle_type: tripsFields[index].id_vehicle_type,
      personByTrip:
        persons
          ?.map((p) => ({
            id_person_transfer_request:
              selectedPersons.find(
                (s) =>
                  s.id === p.id &&
                  !tripsFields.some(
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
    updateTrip(index, {
      id: tripsFields[index].id,
      id_vehicle_type,
      materialByTrip: tripsFields[index].materialByTrip,
      personByTrip: tripsFields[index].personByTrip
    });
  };

  const handleSave = async (data: any) => {
    try {
      if (tripsFields.length === 0 && otherRequirementsFields.length === 0) {
        message.error("Debe agregar al menos una sección de vehículos o requerimientos");
        return;
      }
      const res = await submitTrips(
        journey.id_transfer_request,
        journey.id,
        data.trips,
        data.otherRequirements
      );
      console.log("RES", res);
      reset({
        trips: res.trips.map((t) => ({
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
        })),
        otherRequirements: res.otherRequirements.map((req) => ({
          idRequirement: req.idRequirement,
          units: req.units,
          description: req.description
        }))
      });
    } catch (error) {
      console.error(error);
    }
  };
  const columnsRequirements: TableProps<IRequirement>["columns"] = [
    {
      title: "Nombre",
      dataIndex: "description",
      key: "description",
      render: (total) => <Text>{total}</Text>,
      sorter: (a, b) => a.description.localeCompare(b.description),
      showSorterTooltip: false
    },
    {
      title: "Cantidad",
      dataIndex: "id_other_requeriments",
      key: "id_other_requeriments",
      render: (_, record) => (
        <Flex align="center" justify="center">
          <Button
            type="text"
            size="small"
            onClick={() => handleRemoveRequirement(record.idRequirement)}
          >
            <CaretLeft />
          </Button>
          {record.units}
          <Button
            type="text"
            size="small"
            onClick={() => handleAddRequirement(record.idRequirement)}
          >
            <CaretRight />
          </Button>
        </Flex>
      ),
      showSorterTooltip: false
    },
    {
      title: "",
      dataIndex: "delete",
      key: "delete",
      render: (_, record) => (
        <Popconfirm
          title="Esta seguro de eliminar?"
          onConfirm={() => handleDeleteRequirement(record.idRequirement)}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 32,
              width: 32
            }}
          >
            <Trash size={24} />
          </div>
        </Popconfirm>
      )
    }
  ];
  const tag = (
    <div className="collapseInformationWrapper">
      {tripsFields.map((section, index) => (
        <Trip
          key={`Trip-${index}`}
          transferRequest={transferRequest}
          index={index}
          id_journey={id_journey}
          id_type_service={id_type_service}
          onRemove={() => removeTrip(index)}
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
      {requirements?.length > 0 && (
        <div className="collapseInformationContainer">
          <Table columns={columnsRequirements} dataSource={requirements} pagination={false} />
        </div>
      )}
      <div className="collapseButtons">
        <Flex gap={16}>
          <Button
            className="collapseAddVehicleButton"
            onClick={addVehiclesSections}
            loading={isLoadingVehicles}
          >
            Agregar vehículo
          </Button>
          <Button
            className="collapseAddVehicleButton"
            onClick={() => setIsModalAddRequirementOpen(true)}
            loading={false}
          >
            Agregar requerimiento
          </Button>
        </Flex>
        <Flex gap={5}>
          {!!formState.dirtyFields?.trips?.length && (
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
            disabled={
              !formState.dirtyFields?.trips?.length &&
              !formState.dirtyFields?.otherRequirements?.length
            }
            onClick={handleSubmit(handleSave)}
          >
            Guardar
          </Button>
        </Flex>
      </div>
    </div>
  );

  return (
    <>
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
      <AddRequirementModal
        isModalOpen={isModalAddRequirementOpen}
        otherRequirementsOptions={otherRequirementsOptions}
        selectedRequirement={selectedRequirement}
        setSelectedRequirement={setSelectedRequirement}
        setIsModalOpen={setIsModalAddRequirementOpen}
        appendRequirement={appendRequirement}
        isLoadingRequirements={isLoadingRequirements}
      />
    </>
  );
};

export default VehiclesSelection;
