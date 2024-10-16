"use client";
import { message, Skeleton } from "antd";
import "../../../../../styles/_variables_logistics.css";
import "./vehicleInfo.scss";
import { VehicleFormTab } from "@/components/molecules/tabs/logisticsForms/vehicleForm/vehicleFormTab";
import { getVehicleById, getVehicleType, updateVehicle } from "@/services/logistics/vehicle";
import useSWR, { mutate } from "swr";
import { useCallback, useState } from "react";
import { StatusForm } from "@/components/molecules/tabs/logisticsForms/vehicleForm/vehicleFormTab.mapper";
import { getDocumentsByEntityType } from "@/services/logistics/certificates";

interface Props {
  idParam: string;
  params: {
    id: string;
    vehicleId: string;
  };
}

export const VehicleInfoView = ({ idParam = "", params }: Props) => {
  const [statusForm, setStatusForm] = useState<StatusForm>("review");
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const fetcher = async ({ id }: { id: string }) => {
    return getVehicleById(id);
  };

  const handleFormState = useCallback((newFormState: StatusForm) => {
    setStatusForm(newFormState);
  }, []);

  const { data, isLoading, isValidating } = useSWR({ id: idParam, key: "1" }, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: true
  });

  const handleSubmit = async (data: any) => {
    setIsLoadingSubmit(true);
    try {
      const response = await updateVehicle({ ...data }, data.files, data.images);
      if (response && response.status === 200) {
        setIsLoadingSubmit(false);
        message.success("Vehículo editado", 2, () => setStatusForm("review"));
        mutate({ id: params, key: "1" });
      }
    } catch (error) {
      setIsLoadingSubmit(false);
      message.error(error instanceof Error ? error.message : "Error al editar vehículo", 2);
    }
  };

  const { data: documentsType, isLoading: isLoadingDocuments } = useSWR(
    "1",
    getDocumentsByEntityType,
    { revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  const { data: vehiclesTypesData, isLoading: isLoadingVehicles } = useSWR(
    "vehicles-types-data",
    getVehicleType,
    { revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  return (
    <Skeleton active loading={isLoading || isValidating || isLoadingDocuments || isLoadingVehicles}>
      <VehicleFormTab
        statusForm={statusForm}
        handleFormState={handleFormState}
        data={data}
        params={params}
        onSubmitForm={handleSubmit}
        documentsTypesList={documentsType ?? []}
        vehiclesTypesList={vehiclesTypesData ?? []}
        isLoading={isLoadingSubmit}
      />
    </Skeleton>
  );
};
