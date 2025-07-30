"use client";
import { useState } from "react";
import { message, Skeleton } from "antd";
import { useRouter } from "next/navigation";
import useSWR from "swr";

import { getVehicleType } from "@/services/logistics/vehicle";
import { addDriver, getTripTypes } from "@/services/logistics/drivers";
import { getDocumentsByEntityType } from "@/services/logistics/certificates";

import { DriverFormTab } from "@/components/molecules/tabs/logisticsForms/driverForm/driverFormTab";

import { ISubmitDriver } from "@/types/logistics/schema";

import "./createDriver.scss";

type Props = {
  params: {
    id: string;
    driverId: string;
  };
};

export const CreateDriverView = ({ params }: Props) => {
  const { push } = useRouter();

  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const onCreateDriver = async (data: ISubmitDriver) => {
    const generalData = {
      ...data.general,
      company_id: params.id
    };

    try {
      setIsLoadingSubmit(true);

      const response = await addDriver(generalData, data.logo, data.uploadedFiles);
      if (response) {
        message.success("Conductor creado", 2).then(() => {
          push(`/logistics/providers/${params.id}/driver`);
        });
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al crear conductor", 3);
    } finally {
      setIsLoadingSubmit(false);
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
  const { data: tripTypes, isLoading: isloadingTripTypes } = useSWR("getTripTypesDriver", getTripTypes, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });
  return (
    <Skeleton active loading={isLoadingDocuments || isLoadingVehicles || isloadingTripTypes}>
      <DriverFormTab
        isLoadingSubmit={isLoadingSubmit}
        onSubmitForm={onCreateDriver}
        statusForm={"create"}
        params={params}
        documentsTypesList={documentsType ?? []}
        vehiclesTypesList={vehiclesTypesData ?? []}
        tripTypes={tripTypes ?? []}
      />
    </Skeleton>
  );
};
