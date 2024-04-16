import { Dispatch, SetStateAction, useState } from "react";
import { Flex, Modal, Typography } from "antd";
import { useForm } from "react-hook-form";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { ClientsProjectTable } from "@/components/molecules/tables/ClientsProjectTable/ClientsProjectTable";

import "./modalCreateClientsGroup.scss";

const { Text } = Typography;

interface CreateGroupProps {
  isOpen: boolean;
  setIsCreateGroup: Dispatch<SetStateAction<boolean>>;
}

export type NameType = {
  name: string;
};

export const ModalCreateClientsGroup = ({ isOpen, setIsCreateGroup }: CreateGroupProps) => {
  const [groupName, setGroupName] = useState("");
  const [selectedRows, setSelectedRows] = useState<any>([]);

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<NameType>({
    defaultValues: { name: "" }
  });

  const onSubmitName = (data: NameType) => {
    setGroupName(data.name);
  };

  const onCancel = () => {
    setIsCreateGroup(false);
    setGroupName("");
  };

  return (
    <>
      {groupName === "" ? (
        <Modal
          title="Nuevo Grupo de Clientes"
          open={isOpen}
          onCancel={onCancel}
          okButtonProps={{
            className: "buttonOk"
          }}
          cancelButtonProps={{
            className: "buttonCancel"
          }}
          okText="Continuar"
          cancelText="Cancelar"
          className="modalCreateClientsGroup"
          onOk={() => {
            handleSubmit(onSubmitName)();
          }}
        >
          <Flex vertical>
            <Text>Ingresa el nombre del grupo de clientes</Text>
            <form className="inputcreatezone">
              <InputForm
                titleInput="Nombre del grupo"
                control={control}
                nameInput="name"
                error={errors.name}
                customStyle={{
                  width: "96%",
                  backgroundColor: "transparent !important",
                  border: "1px solid white",
                  borderRadius: ".8rem"
                }}
                placeholder="Nombre"
              />
            </form>
          </Flex>
        </Modal>
      ) : (
        <Modal
          width={900}
          title={groupName}
          open={isOpen}
          onCancel={onCancel}
          okButtonProps={{
            className: "buttonOk"
          }}
          cancelButtonProps={{
            className: "buttonCancel"
          }}
          okText="Crear Grupo"
          cancelText="Cancelar"
          className="modalCreateClientsGroup"
          onOk={() => {
            console.log("Crear Grupo clickeado");
            console.log(selectedRows);
          }}
        >
          <Flex vertical>
            <Text>Selecciona los clientes para añadir al grupo</Text>
            <ClientsProjectTable placedIn="modal" setSelectedRows={setSelectedRows} />
          </Flex>
        </Modal>
      )}
    </>
  );
};
