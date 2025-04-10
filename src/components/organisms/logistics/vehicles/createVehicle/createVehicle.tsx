"use client";
import { message, Skeleton } from "antd";
import { useRouter } from "next/navigation";
import "../../../../../styles/_variables_logistics.css";
import "./createVehicle.scss";
import { VehicleFormTab } from "@/components/molecules/tabs/logisticsForms/vehicleForm/vehicleFormTab";
import { addVehicle, getFeaturesVehicle, getVehicleType } from "@/services/logistics/vehicle";
import { useState } from "react";
import { getDocumentsByEntityType } from "@/services/logistics/certificates";
import useSWR from "swr";

type Props = {
  params: {
    id: string;
    vehicleId: string;
  };
};

export const CreateVehicleView = ({ params }: Props) => {
  const { push } = useRouter();
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoadingSubmit(true);
    try {
      const response = await addVehicle({ ...data }, data.files, data.images);
      if (response && response.status === 200) {
        setIsLoadingSubmit(false);
        message.success("Vehículo creado", 3, () =>
          push(`/logistics/providers/${params.id}/vehicle`)
        );
      }
    } catch (error) {
      setIsLoadingSubmit(false);
      message.error(error instanceof Error ? error.message : "Error al crear vehículo", 3);
    }
  };
  const { data: documentsType, isLoading: isLoadingDocuments } = useSWR(
    "documents/type/1",
    () => getDocumentsByEntityType("1"),
    { revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  const { data: vehiclesTypesData, isLoading: isLoadingVehicles } = useSWR(
    "/vehicle/type",
    getVehicleType,
    { revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  const { data: features, isLoading: isLoadingFeatures } = useSWR(
    "/features/vehicles",
    getFeaturesVehicle,
    { revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  return (
    <Skeleton active loading={isLoadingDocuments || isLoadingVehicles || isLoadingFeatures}>
      <VehicleFormTab
        onSubmitForm={handleSubmit}
        statusForm={"create"}
        params={params}
        documentsTypesList={documentsType ?? []}
        vehiclesTypesList={vehiclesTypesData ?? []}
        isLoading={isLoadingSubmit}
        features={features || []}
      />
    </Skeleton>
  );
};
