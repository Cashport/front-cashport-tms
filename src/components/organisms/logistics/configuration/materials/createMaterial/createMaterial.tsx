"use client";
import { message, Skeleton } from "antd";
import { useRouter } from "next/navigation";
import "../../../../../../styles/_variables_logistics.css";
import "./createMaterial.scss";
import { MaterialFormTab } from "@/components/molecules/tabs/logisticsForms/materialForm/materialFormTab";
import {
  addMaterial,
  getAllMaterialTransportType,
  getAllMaterialType
} from "@/services/logistics/materials";
import { useState } from "react";
import useSWR from "swr";

type Props = {
  params: {
    id: string;
    materialId: string;
  };
};

export const CreateMaterialView = ({ params }: Props) => {
  const { push } = useRouter();
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const handleSubmit = async (data: any) => {
    try {
      const response = await addMaterial({ ...data }, data.images);
      if (response && response.status === 200) {
        setIsLoadingSubmit(false);
        message.success(`Material creado`, 2, () => push(`/logistics/configuration/materials/all`));
      }
    } catch (error) {
      setIsLoadingSubmit(false);
      message.error(error instanceof Error ? error.message : "Hubo un error al crear material", 3);
    }
  };

  const { data: materialsTypesData, isLoading: loadingMaterialsTypes } = useSWR(
    "materialtypes",
    getAllMaterialType,
    { revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const { data: materialsTransportTypesData, isLoading: loadingMaterialsTransportTypes } = useSWR(
    "materialtransporttypes",
    getAllMaterialTransportType,
    { revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  return (
    <Skeleton active loading={loadingMaterialsTypes || loadingMaterialsTransportTypes}>
      <MaterialFormTab
        onSubmitForm={handleSubmit}
        statusForm={"create"}
        params={params}
        isLoadingSubmit={isLoadingSubmit}
        materialsTransportTypesData={materialsTransportTypesData ?? []}
        materialsTypesData={materialsTypesData ?? []}
      />
    </Skeleton>
  );
};
