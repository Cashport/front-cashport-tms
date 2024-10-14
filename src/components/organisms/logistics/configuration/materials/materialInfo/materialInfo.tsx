"use client";
import { message, Skeleton } from "antd";
import React, { useCallback, useState } from "react";
import "../../../../../../styles/_variables_logistics.css";
import "./materialInfo.scss";
import {
  getAllMaterialTransportType,
  getAllMaterialType,
  getMaterialById,
  updateMaterial,
  updateMaterialStatus
} from "@/services/logistics/materials";
import { CustomFile, IFormMaterial } from "@/types/logistics/schema";
import { StatusForm } from "@/components/molecules/tabs/logisticsForms/materialForm/materialFormTab.mapper";
import useSWR, { mutate } from "swr";
import { MaterialFormTab } from "@/components/molecules/tabs/logisticsForms/materialForm/materialFormTab";

interface Props {
  params: {
    id: string;
    materialId: string;
  };
}

export const MaterialInfoView = ({ params }: Props) => {
  const [statusForm, setStatusForm] = useState<StatusForm>("review");
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const handleFormState = useCallback((newFormState: StatusForm) => {
    setStatusForm(newFormState);
  }, []);

  const fetcher = async () => {
    return getMaterialById(params.id);
  };

  const { data, isLoading } = useSWR({ id: params, key: "1" }, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const handleSubmitForm = async (data: IFormMaterial) => {
    data.general.id = Number(params.id);
    setIsLoadingSubmit(true);
    try {
      const response = await updateMaterial(data.general, data?.images as CustomFile[]);
      if (response.status === 200) {
        setIsLoadingSubmit(false);
        message.success(`Material editado`, 2, () => setStatusForm("review"));
        //mutate({ id: params, key: "1" }, response, false);
      }
    } catch (error) {
      message.error(`Hubo un error por favor intenta mas tarde.`, 2, () => setStatusForm("review"));
    }
  };

  const handleChangeStatus = async (newStatus: boolean) => {
    console.log("active");
    try {
      const response = await updateMaterialStatus(params.id, newStatus ? "1" : "0");
      if (response.status === 200) {
        message.success(`Material ${newStatus ? "activado" : "inactivado"}`, 2, () =>
          setStatusForm("review")
        );
      }
    } catch (error) {
      message.error(`Hubo un error por favor intenta mas tarde.`, 2, () => setStatusForm("review"));
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
    <Skeleton active loading={isLoading || loadingMaterialsTypes || loadingMaterialsTransportTypes}>
      <MaterialFormTab
        onSubmitForm={handleSubmitForm}
        data={data?.[0]}
        params={params}
        statusForm={statusForm}
        handleFormState={handleFormState}
        onActiveMaterial={() => handleChangeStatus(true)}
        onDesactivateMaterial={() => handleChangeStatus(false)}
        isLoadingSubmit={isLoadingSubmit}
        materialsTransportTypesData={materialsTransportTypesData ?? []}
        materialsTypesData={materialsTypesData ?? []}
      />
    </Skeleton>
  );
};
