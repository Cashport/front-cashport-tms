"use client";
import { message, Skeleton } from "antd";
import { useRouter } from "next/navigation";
import "../../../../../../styles/_variables_logistics.css";
import "./createGrouplocation.scss";
import { GroupLocationFormTab } from "@/components/molecules/tabs/logisticsForms/grouplocationForm/grouplocationFormTab";
import { addMaterial } from "@/services/logistics/materials";
import { useState } from "react";
import useSWR from "swr";
import { getAllStatesByCountry } from "@/services/logistics/locations";

type Props = {
  params: {
    id: string;
    groupLocationId: string;
  };
};

export const CreateGroupLocationView = ({ params }: Props) => {
  const { push } = useRouter();
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoadingSubmit(true);
    try {
      const response = await addMaterial({ ...data }, data.images);
      if (response && response.status === 200) {
        setIsLoadingSubmit(false);
        message.success(`Grupo de ubicaciónes creado`, 2, () =>
          push(`/logistics/configuration/grouplocations/all`)
        );
      }
    } catch (error) {
      setIsLoadingSubmit(false);
      message.error(
        error instanceof Error ? error.message : "Hubo un error al crear grupo de ubicaciones",
        2
      );
    }
  };

  const { data: statesData, isLoading: isLoadingStates } = useSWR("1", getAllStatesByCountry, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  return (
    <Skeleton active loading={isLoadingStates}>
      <GroupLocationFormTab
        onSubmitForm={handleSubmit}
        statusForm={"create"}
        params={params}
        isLoadingSubmit={isLoadingSubmit}
        statesData={statesData ?? []}
      />
    </Skeleton>
  );
};
