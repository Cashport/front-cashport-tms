"use client";
import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

import { message, Skeleton } from "antd";

import { ICreateVehicleForm } from "../../vehicles/createVehicle/createVehicle";
import { getDocumentsByEntityType } from "@/services/logistics/certificates";
import { getVehicleType } from "@/services/logistics/vehicle";
import {
  getDriverById,
  getTripTypes,
  updateDriver,
  updateDriverStatus
} from "@/services/logistics/drivers";

import { DriverFormTab } from "@/components/molecules/tabs/logisticsForms/driverForm/driverFormTab";
import { StatusForm } from "@/components/molecules/tabs/logisticsForms/driverForm/driverFormTab.mapper";

import { ISubmitDriver } from "@/types/logistics/schema";

import "../../../../../styles/_variables_logistics.css";
import "./driverInfo.scss";

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

  const { data, isLoading, isValidating } = useSWR(params.driverId, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: true
  });

  const handleSubmitForm = async (data: ISubmitDriver) => {
    const generalData = {
      ...data.general,
      company_id: params.id
    };

    try {
      setIsLoadingSubmit(true);
      const response = await updateDriver(
        generalData,
        data.logo as any,
        data?.uploadedFiles as ICreateVehicleForm["uploadedFiles"]
      );
      message.success("Conductor editado", 2).then(() => {
        push(`/logistics/providers/${params.id}/driver/${response.id}`);
        setStatusForm("review");
      });
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al editar conductor", 3);
    } finally {
      setIsLoadingSubmit(false);
    }
  };
  const handlechangeStatus = async (status: 0 | 1 | 2) => {
    const statusText = {
      0: "Conductor desactivado",
      1: "Conductor activado",
      2: "Conductor auditado"
    };
    try {
      await updateDriverStatus(params.driverId, status);
      message.success(`${statusText[status]} `, 2).then(() => {
        push(`/logistics/providers/${params.id}/driver`);
        setStatusForm("review");
      });
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error al editar estado del conductor",
        3
      );
    }
  };

  const { data: documentsType, isLoading: isLoadingDocuments } = useSWR(
    "documents/type/2",
    () => getDocumentsByEntityType("2"),
    { revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  const { data: vehiclesTypesData, isLoading: isLoadingVehicles } = useSWR(
    "/vehicle/type",
    getVehicleType,
    { revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  const { data: tripTypes, isLoading: isloadingTripTypes } = useSWR("1", getTripTypes, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });
  return (
    <Skeleton
      active
      loading={
        isLoadingDocuments || isLoadingVehicles || isLoading || isValidating || isloadingTripTypes
      }
    >
      <DriverFormTab
        onSubmitForm={handleSubmitForm}
        data={data}
        params={params}
        statusForm={statusForm}
        handleFormState={handleFormState}
        onActiveProject={() => handlechangeStatus(1)}
        onDesactivateProject={() => handlechangeStatus(0)}
        onAuditDriver={() => handlechangeStatus(2)}
        documentsTypesList={documentsType ?? []}
        vehiclesTypesList={vehiclesTypesData ?? []}
        isLoadingSubmit={isLoadingSubmit}
        tripTypes={tripTypes ?? []}
      />
    </Skeleton>
  );
};
