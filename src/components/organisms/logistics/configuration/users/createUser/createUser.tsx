"use client";
import { message } from "antd";
import { useRouter } from "next/navigation";
import "../../../../../../styles/_variables_logistics.css";
import "./createUser.scss";
import { UserFormTab } from "@/components/molecules/tabs/logisticsForms/userForm/userFormTab";
import { addUser } from "@/services/logistics/users";
import { useState } from "react";

type Props = {
  params: {
    id: string;
    userId: string;
  };
};

export const CreateUserView = ({ params }: Props) => {
  const { push } = useRouter();
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      const response = await addUser({ ...data }, data.logo);
      if (response && response.status === 200) {
        setIsLoadingSubmit(false);
        message.success("Usuario creado", 2, () => push(`/logistics/configuration/users/all`));
      }
    } catch (error: any) {
      setIsLoadingSubmit(false);
      message.error("Error al crear usuario", 3);
    }
  };
  return (
    <UserFormTab
      onSubmitForm={handleSubmit}
      statusForm={"create"}
      params={params}
      isLoadingSubmit={isLoadingSubmit}
    />
  );
};
