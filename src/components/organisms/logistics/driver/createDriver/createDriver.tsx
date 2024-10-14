"use client";
import { message, Skeleton } from "antd";
import { useRouter } from "next/navigation";
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
    setIsLoadingSubmit(true);
    try {
      const response = await addDriver(
        data.general,
        data.logo as any,
        data?.files as DocumentCompleteType[]
      );
      if (response.status === 200) {
        setIsLoadingSubmit(false);
        message.success("Conductor creado", 2, () =>
          push(`/logistics/providers/${params.id}/driver`)
        );
      }
    } catch (error) {
      setIsLoadingSubmit(false);
      message.error("Error al crear conductor", 2, () =>
        push(`/logistics/providers/${params.id}/driver`)
      );
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
