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
interface Props {
  params: {
    id: string;
    userId: string;
  };
}

export const UserInfoView = ({ params }: Props) => {
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
        message.success("Usuario editado", 2, () => setStatusForm("review"));
      }
    } catch (error) {
      setIsLoadingSubmit(false);
      message.error("Error al editar usuario", 2, () => setStatusForm("review"));
    }
  };

  const handleActivation = async () => {
    try {
      const response = await updateUserStatus(params.id, "1");
      if (response.status === 200) {
        message.success("Usuario activado", 2, () => setStatusForm("review"));
      }
    } catch (error) {
      message.error("Error al activar usuario", 2, () => setStatusForm("review"));
    }
  };

  const handleDesactivation = async () => {
    try {
      const response = await updateUserStatus(params.id, "0");
      if (response.status === 200) {
        message.success("Usuario desactivado", 2, () => setStatusForm("review"));
      }
    } catch (error) {
      message.error("Error al desactivar usuario", 2, () => setStatusForm("review"));
    }
  };

  return (
    <Skeleton active loading={isLoading}>
      <UserFormTab
        onSubmitForm={handleSubmitForm}
        data={data?.data?.data as unknown as IUser}
        params={params}
        statusForm={statusForm}
        handleFormState={handleFormState}
        onActiveUser={handleActivation}
        onDesactivateUser={handleDesactivation}
        isLoadingSubmit={isLoadingSubmit}
      />
    </Skeleton>
  );
};
