"use client";
import { Typography, message, Spin } from "antd";
import React, { useCallback, useState } from "react";
import "../../../../../../styles/_variables_logistics.css";
import "./grouplocationInfo.scss";
import {
  getMaterialById,
  updateMaterial,
  updateMaterialStatus
} from "@/services/logistics/materials";
import { CustomFile, IFormMaterial } from "@/types/logistics/schema";
import { StatusForm } from "@/components/molecules/tabs/logisticsForms/materialForm/materialFormTab.mapper";
import { useRouter } from "next/navigation";
import { DocumentCompleteType } from "@/types/logistics/certificate/certificate";
import useSWR from "swr";
import { MaterialFormTab } from "@/components/molecules/tabs/logisticsForms/materialForm/materialFormTab";

interface Props {
  params: {
    id: string;
    materialId: string;
  };
}

export const GroupLocationInfoView = ({ params }: Props) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [statusForm, setStatusForm] = useState<StatusForm>("review");
  const { push } = useRouter();

  const handleFormState = useCallback((newFormState: StatusForm) => {
    setStatusForm(newFormState);
  }, []);

  const fetcher = async ({ id, key }: { id: string; key: string }) => {
    return getMaterialById(params.id);
  };

  const { data, isLoading } = useSWR({ id: params, key: "1" }, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const handleSubmitForm = async (data: IFormMaterial) => {
    data.general.id = Number(params.id);
    try {
      const response = await updateMaterial(data.general, data?.images as CustomFile[]);
      if (response.status === 200) {
        messageApi.open({
          type: "success",
          content: "La ubicación fue editada exitosamente."
        });
        push(`/logistics/configuration/materials/${params.id}`);
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Oops, hubo un error por favor intenta mas tarde."
      });
    }
  };

  const handleActivation = async () => {
    console.log("active");
    try {
      const response = await updateMaterialStatus(params.id, "1");
      if (response.status === 200) {
        messageApi.open({
          type: "success",
          content: "El material fue editado exitosamente."
        });
        setStatusForm("review");
        push(`/logistics/configuration/materials/${params.id}`);
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Oops, hubo un error por favor intenta mas tarde."
      });
    }
  };

  const handleDesactivation = async () => {
    console.log("desactive");
    try {
      const response = await updateMaterialStatus(params.id, "0");
      if (response.status === 200) {
        messageApi.open({
          type: "success",
          content: "El material fue editado exitosamente."
        });
        setStatusForm("review");
        push(`/logistics/configuration/materials/${params.id}`);
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Oops, hubo un error por favor intenta mas tarde."
      });
    }
  };

  console.log(data);
  return (
    <>
      {contextHolder}
      <>
        {isLoading ? (
          <Spin />
        ) : (
          <MaterialFormTab
            onSubmitForm={handleSubmitForm}
            data={data?.[0]}
            params={params}
            statusForm={statusForm}
            handleFormState={handleFormState}
            onActiveMaterial={handleActivation}
            onDesactivateMaterial={handleDesactivation}
            isLoadingSubmit={false}
            materialsTypesData={[]}
            onEditProject={() => {}}
            materialsTransportTypesData={[]}
          />
        )}
      </>
    </>
  );
};
