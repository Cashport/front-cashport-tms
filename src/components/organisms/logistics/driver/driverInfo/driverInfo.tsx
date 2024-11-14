"use client";
import { message, Skeleton } from "antd";
import React, { useCallback, useState } from "react";
import "../../../../../styles/_variables_logistics.css";
import "./driverInfo.scss";
import { DriverFormTab } from "@/components/molecules/tabs/logisticsForms/driverForm/driverFormTab";
import { getDriverById, updateDriver, updateDriverStatus } from "@/services/logistics/drivers";
import { IFormDriver } from "@/types/logistics/schema";
import { StatusForm } from "@/components/molecules/tabs/logisticsForms/driverForm/driverFormTab.mapper";
import { useRouter } from "next/navigation";
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
  const { push } = useRouter();
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
    try {
      setIsLoadingSubmit(true);
      const response = await updateDriver(
        data.general,
        data.logo as any,
        data?.files as DocumentCompleteType[]
      );
      message.success("El conductor fue editado exitosamente.", 2).then(() => {
        push(`/logistics/providers/${params.id}/driver/${response.id}`);
        setStatusForm("review");
      });
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al editar conductor", 4);
    } finally {
      setIsLoadingSubmit(false);
    }
  };
  const handlechangeStatus = async (status: boolean) => {
    try {
      await updateDriverStatus(params.driverId, status);
      message.success("El conductor fue editado exitosamente.", 2).then(() => {
        push(`/logistics/providers/${params.id}/driver`);
      });
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al editar conductor", 3);
    }
  };
  const { data: documentsType, isLoading: isLoadingDocuments } = useSWR(
    "2",
    getDocumentsByEntityType,
    { revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  const { data: vehiclesTypesData, isLoading: isLoadingVehicles } = useSWR(
    "/vehicle/type",
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
        vehiclesTypesList={vehiclesTypesData?.data ?? []}
        isLoadingSubmit={isLoadingSubmit}
      />
    </Skeleton>
  );
};
