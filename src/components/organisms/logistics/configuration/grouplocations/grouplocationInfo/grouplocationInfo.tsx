"use client";
import { Typography, message, Spin, Skeleton } from "antd";
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
import useSWR from "swr";
import { MaterialFormTab } from "@/components/molecules/tabs/logisticsForms/materialForm/materialFormTab";
import { GroupLocationFormTab } from "@/components/molecules/tabs/logisticsForms/grouplocationForm/grouplocationFormTab";
import { getAllStatesByCountry } from "@/services/logistics/locations";

interface Props {
  params: {
    id: string;
    materialId: string;
  };
}

export const GroupLocationInfoView = ({ params }: Props) => {
  // const [statusForm, setStatusForm]= useState<StatusForm>("review")
  // const { push } = useRouter();
  // const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  // const handleFormState = useCallback((newFormState:StatusForm) => {
  //   setStatusForm(newFormState);
  // }, []);

  // const fetcher = async () => {
  //   return getMaterialById(params.id);
  // };

  // const { data, isLoading } = useSWR({ id: params, key: "1" }, fetcher,
  //   { revalidateIfStale:false,
  //   revalidateOnFocus:false,
  //   revalidateOnReconnect:false
  // });

  // const handleSubmitForm = async (data: IFormMaterial) => {
  //   data.general.id = Number(params.id);
  //   try {
  //     const response = await updateMaterial(
  //       data.general,
  //       data?.images as CustomFile[]
  //     );
  //     if (response.status === 200) {
  //       messageApi.open({
  //         type: "success",
  //         content: "La ubicación fue editada exitosamente."
  //       });
  //       push(`/logistics/configuration/materials/${params.id}`);
  //     }
  //   } catch (error) {
  //     messageApi.open({
  //       type: "error",
  //       content: "Oops, hubo un error por favor intenta mas tarde."
  //     });
  //   }
  // };

  // const handleActivation= async() =>{
  //   console.log('active')
  //   try {
  //     const response = await updateMaterialStatus(params.id,'1');
  //     if (response.status === 200) {
  //       messageApi.open({
  //         type: "success",
  //         content: "El material fue editado exitosamente."
  //       });
  //       setStatusForm('review');
  //       push(`/logistics/configuration/materials/${params.id}`);
  //     }
  //   } catch (error) {
  //     messageApi.open({
  //       type: "error",
  //       content: "Oops, hubo un error por favor intenta mas tarde."
  //     });
  //   }
  // };

  // const handleDesactivation= async() =>{
  //   console.log('desactive')
  //   try {
  //     const response = await updateMaterialStatus(params.id,'0');
  //     if (response.status === 200) {
  //       messageApi.open({
  //         type: "success",
  //         content: "El material fue editado exitosamente."
  //       });
  //       setStatusForm('review');
  //       push(`/logistics/configuration/materials/${params.id}`);
  //     }
  //   } catch (error) {
  //     messageApi.open({
  //       type: "error",
  //       content: "Oops, hubo un error por favor intenta mas tarde."
  //     });
  //   }
  // };
  // const { data: statesData, isLoading: isLoadingStates } = useSWR("1", getAllStatesByCountry, {
  //   revalidateIfStale: false,
  //   revalidateOnFocus: false,
  //   revalidateOnReconnect: false
  // });

  return <Skeleton active loading={true}></Skeleton>;
};
