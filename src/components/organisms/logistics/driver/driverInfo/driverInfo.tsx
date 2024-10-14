"use client";
import { message, Skeleton } from "antd";
import React, { useCallback, useState } from "react";
import { DriverFormTab } from "@/components/molecules/tabs/logisticsForms/driverForm/driverFormTab";
import { getDriverById, updateDriver, updateDriverStatus } from "@/services/logistics/drivers";
import { IFormDriver } from "@/types/logistics/schema";
import { StatusForm } from "@/components/molecules/tabs/logisticsForms/driverForm/driverFormTab.mapper";
import { DocumentCompleteType } from "@/types/logistics/certificate/certificate";
import useSWR from "swr";
import { getDocumentsByEntityType } from "@/services/logistics/certificates";
import { getVehicleType } from "@/services/logistics/vehicle";

interface Props {
  params: {
    id: string;
    driverId: string;
  };
}

export const DriverInfoView = ({ params }: Props) => {
  const [statusForm, setStatusForm] = useState<StatusForm>("review");
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const handleFormState = useCallback((newFormState: StatusForm) => {
    setStatusForm(newFormState);
  }, []);

  const fetcher = async () => {
    return getDriverById(params.driverId);
  };

  const { data, isLoading, isValidating } = useSWR({ id: params, key: "1" }, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: true
  });

  const handleSubmitForm = async (data: IFormDriver) => {
    data.general.company_id = params.id;
    setIsLoadingSubmit(true);
    try {
      const response = await updateDriver(
        data.general,
        data.logo as any,
        data?.files as DocumentCompleteType[]
      );
      if (response.status === 200) {
        setIsLoadingSubmit(false);
        message.success("Conductor editado", 2, () => setStatusForm("review"));
      }
    } catch (error) {
      setIsLoadingSubmit(false);
      message.success("Error al editar conductor", 2, () => setStatusForm("review"));
    }
  };
  const handlechangeStatus = async (status: boolean) => {
    try {
      const response = await updateDriverStatus(params.driverId, status);
      if (response) {
        message.success(`Conductor ${status ? "activado" : "inactivado"}`, 2, () =>
          setStatusForm("review")
        );
      }
    } catch (error) {
      message.error(`Error al ${status ? "activar" : "inactivar"} conductor`, 2, () =>
        setStatusForm("review")
      );
    }
  };
  const { data: documentsType, isLoading: isLoadingDocuments } = useSWR(
    "documents-types",
    getDocumentsByEntityType,
    { revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  const { data: vehiclesTypesData, isLoading: isLoadingVehicles } = useSWR(
    "vehicles-types-data",
    getVehicleType,
    { revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  return (
    <Skeleton active loading={isLoadingDocuments || isLoadingVehicles || isLoading || isValidating}>
      <DriverFormTab
        onSubmitForm={handleSubmitForm}
        data={data?.data?.data[0]}
        params={params}
        statusForm={statusForm}
        handleFormState={handleFormState}
        onActiveProject={() => handlechangeStatus(true)}
        onDesactivateProject={() => handlechangeStatus(false)}
        documentsTypesList={documentsType ?? []}
        vehiclesTypesList={vehiclesTypesData ?? []}
        isLoadingSubmit={isLoadingSubmit}
      />
    </Skeleton>
  );
};
