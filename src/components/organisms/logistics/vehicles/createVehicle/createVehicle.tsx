"use client";
import { useState } from "react";
import { message, Skeleton } from "antd";
import useSWR from "swr";
import { useRouter } from "next/navigation";

import { getDocumentsByEntityType } from "@/services/logistics/certificates";
import { addVehicle, getFeaturesVehicle, getVehicleType } from "@/services/logistics/vehicle";

import { VehicleFormTab } from "@/components/molecules/tabs/logisticsForms/vehicleForm/vehicleFormTab";
import { IUploadRequirementstTableRow } from "../../proveedores/ModalUploadRequirements/ModalUploadRequirements";

import { CustomFile, IFormGeneralVehicle } from "@/types/logistics/schema";

import "./createVehicle.scss";
import "../../../../../styles/_variables_logistics.css";

type Props = {
  params: {
    id: string;
    vehicleId: string;
  };
};

export interface ICreateVehicleForm extends IFormGeneralVehicle {
  uploadedFiles?: IUploadRequirementstTableRow[];
}

export const CreateVehicleView = ({ params }: Props) => {
  const { push } = useRouter();
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const handleSubmit = async (data: ICreateVehicleForm, imageFiles: CustomFile[]) => {
    setIsLoadingSubmit(true);
    try {
      await addVehicle({ ...data }, imageFiles);

      message.success("Vehículo creado", 3, () =>
        push(`/logistics/providers/${params.id}/vehicle`)
      );
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al crear vehículo", 3);
    }
    setIsLoadingSubmit(false);
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
