"use client";
import { message, Skeleton } from "antd";
import React, { useCallback, useState } from "react";
import "../../../../../../styles/_variables_logistics.css";
import "./userInfo.scss";
import { IFormUser, IUser } from "@/types/logistics/schema";
import { StatusForm } from "@/components/molecules/tabs/logisticsForms/locationForm/locationFormTab.mapper";
import useSWR from "swr";
import { UserFormTab } from "@/components/molecules/tabs/logisticsForms/userForm/userFormTab";
import { getUserById, updateUser, updateUserStatus } from "@/services/logistics/users";
import { useRouter } from "next/navigation";
interface Props {
  params: {
    id: string;
    userId: string;
  };
}

export const UserInfoView = ({ params }: Props) => {
  const { push } = useRouter();
  const [statusForm, setStatusForm] = useState<StatusForm>("review");
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const handleFormState = useCallback((newFormState: StatusForm) => {
    setStatusForm(newFormState);
  }, []);

  const fetcher = async () => {
    return getUserById(params.id);
  };

  const { data, isLoading } = useSWR({ id: params, key: "1" }, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const handleSubmitForm = async (dataform: any) => {
    const sendata: IFormUser = {
      general: dataform as unknown as IUser,
      logo: dataform.logo
    };
    sendata.general.id = Number(params.id);
    setIsLoadingSubmit(true);
    try {
      const response = await updateUser({ ...dataform }, dataform.logo);
      if (response.status === 200) {
        setIsLoadingSubmit(false);
        message.success("Usuario editado", 2, () => {
          push(`/logistics/configuration/users/${params.id}`);
          setStatusForm("review");
        });
      }
    } catch (error) {
      setIsLoadingSubmit(false);
      message.error("Error al editar usuario", 2);
    }
  };

  const handleChangeStatus = async (newStatus: boolean) => {
    try {
      const response = await updateUserStatus(params.id, newStatus ? "1" : "0");
      if (response.status === 200) {
        message.success(`Usuario ${newStatus ? "activado" : "inactivado"}`, 2, () => {
          push(`/logistics/configuration/users/${params.id}`);
          setStatusForm("review");
        });
      }
    } catch (error) {
      message.error(`Hubo un error por favor intenta mas tarde.`, 2);
    }
  };

  return (
    <Skeleton active loading={isLoading}>
      <UserFormTab
        onSubmitForm={handleSubmitForm}
        data={data?.data as IUser}
        params={params}
        statusForm={statusForm}
        handleFormState={handleFormState}
        onActiveUser={() => handleChangeStatus(true)}
        onDesactivateUser={() => handleChangeStatus(false)}
        isLoadingSubmit={isLoadingSubmit}
      />
    </Skeleton>
  );
};
