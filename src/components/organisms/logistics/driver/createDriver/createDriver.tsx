"use client";
import { message, Skeleton } from "antd";

import { useRouter } from "next/navigation";

import "./createDriver.scss";
import { DriverFormTab } from "@/components/molecules/tabs/logisticsForms/driverForm/driverFormTab";
import { addDriver } from "@/services/logistics/drivers";
import { IFormDriver } from "@/types/logistics/schema";
import { DocumentCompleteType } from "@/types/logistics/certificate/certificate";
import { useState } from "react";
import { getDocumentsByEntityType } from "@/services/logistics/certificates";
import { getVehicleType } from "@/services/logistics/vehicle";
import useSWR from "swr";

type Props = {
  params: {
    id: string;
    driverId: string;
  };
};

export const CreateDriverView = ({ params }: Props) => {
  const { push } = useRouter();

  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const onCreateDriver = async (data: IFormDriver) => {
    data.general.company_id = params.id;
    try {
      setIsLoadingSubmit(true);
      const response = await addDriver(
        data.general,
        data.logo as any,
        data?.files as DocumentCompleteType[]
      );
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
    <Skeleton active loading={isLoadingDocuments || isLoadingVehicles}>
      <DriverFormTab
        isLoadingSubmit={isLoadingSubmit}
        onSubmitForm={onCreateDriver}
        statusForm={"create"}
        params={params}
        documentsTypesList={documentsType ?? []}
        vehiclesTypesList={vehiclesTypesData ?? []}
      />
    </Skeleton>
  );
};
