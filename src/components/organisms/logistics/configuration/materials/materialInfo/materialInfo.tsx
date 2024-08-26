"use client";
import { Typography, message, Spin } from "antd";
import React, { useCallback, useState } from "react";
import "../../../../../../styles/_variables_logistics.css";
import "./materialInfo.scss";
import { getMaterialById, updateMaterial } from "@/services/logistics/materials";
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

export const MaterialInfoView = ({ params }: Props) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [statusForm, setStatusForm]= useState<StatusForm>("review")
  const { push } = useRouter();

  console.log(params)
  const handleFormState = useCallback((newFormState:StatusForm) => {
    setStatusForm(newFormState);
  }, []);

  const fetcher = async ({ id, key }: { id: string; key: string }) => {
    return getMaterialById(params.id);
  };

  const { data, isLoading } = useSWR({ id: params, key: "1" }, fetcher,     
    { revalidateIfStale:false,
    revalidateOnFocus:false,
    revalidateOnReconnect:false
  });

  const handleSubmitForm = async (data: IFormMaterial) => {
    data.general.id = Number(params.id);
    try {
      const response = await updateMaterial(
        data.general,
        data?.files as DocumentCompleteType[],
        data?.images as CustomFile[]
      );
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

  console.log(data)

  return (
    <>
      {contextHolder}
      <>
      {isLoading ? (
          <Spin/>
        ) : (
          <MaterialFormTab
            onSubmitForm={handleSubmitForm}
            data={data?.data?.data[0]}
            params={params}
            statusForm={statusForm}
            handleFormState={handleFormState}
          />
        )}
      </>
    </>
  );
};
