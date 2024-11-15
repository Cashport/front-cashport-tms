"use client";
import { message } from "antd";
import { useRouter } from "next/navigation";
import "../../../../../../styles/_variables_logistics.css";
import "./createGrouplocation.scss";
import { MaterialFormTab } from "@/components/molecules/tabs/logisticsForms/materialForm/materialFormTab";
import { addMaterial } from "@/services/logistics/materials";

type Props = {
  params: {
    id: string;
    materialId: string;
  };
};

export const CreateGroupLocationView = ({ params }: Props) => {
  const { push } = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async (data: any) => {
    try {
      const response = await addMaterial({ ...data }, data.images);
      if (response && response.status === 200) {
        messageApi.open({
          type: "success",
          content: `El material fue creada exitosamente.`
        });
        push(`/logistics/configuration/materials/all`); //${response.data.data.id}
      }
    } catch (error) {
      if (error instanceof Error) {
        messageApi.open({
          type: "error",
          content: error.message
        });
      } else {
        message.open({
          type: "error",
          content: "Oops, hubo un error por favor intenta más tarde."
        });
      }
    }
  };
  return (
    <>
      {contextHolder}
      <MaterialFormTab
        onSubmitForm={handleSubmit}
        statusForm={"create"}
        params={params}
        isLoadingSubmit={false}
        materialsTypesData={[]}
        onActiveMaterial={() => {}}
        onDesactivateMaterial={() => {}}
        onEditProject={() => {}}
        materialsTransportTypesData={[]}
      />
    </>
  );
};
