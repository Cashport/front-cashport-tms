import { Dispatch, SetStateAction, useState } from "react";
import { Button, Flex, Popconfirm, Spin, Table, Typography } from "antd";
import type { MenuProps, TableProps } from "antd";

import { Eye, Plus, Triangle } from "phosphor-react";

import { useUsers } from "@/hooks/useUsers";
import { FilterUsers } from "@/components/atoms/Filters/FilterUsers/FilterUsers";
import { DotsDropdown } from "@/components/atoms/DotsDropdown/DotsDropdown";
import {
  deleteUsersById,
  onResendInvitationUser,
  resendInvitationUsers
} from "@/services/users/users";
import { SUCCESS } from "@/utils/constants/globalConstants";

import { IUserSingle } from "@/types/users/IUsers";
import { UserZone, IBusinessRules } from "@/types/users/IUser";
import { ModalRemove } from "../../modals/ModalRemove/ModalRemove";

import "./usersprojecttable.scss";
import { useMessageApi } from "@/context/MessageContext";

const { Text } = Typography;

interface Props {
  idProject: string;
  setIsCreateUser: Dispatch<SetStateAction<boolean>>;
  setIsViewDetails: Dispatch<SetStateAction<{ active: boolean; id: number }>>;
}

export const UsersProjectTable: React.FC<Props> = ({
  idProject,
  setIsCreateUser,
  setIsViewDetails
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState();
  const [isOpenModalRemove, setIsOpenModalRemove] = useState<boolean>(false);
  const { showMessage } = useMessageApi();

  const onResendInvitation = async (email: string) => {
    const response = await onResendInvitationUser(email);
    if (response.status === SUCCESS) {
      showMessage("success", "La invitacion fue enviada nuevamente.");
    } else {
      showMessage("error", "Oops, hubo un error por favor intenta mas tarde.");
    }
  };
  const columns: TableProps<IUserSingle>["columns"] = [
    {
      title: "Nombre",
      dataIndex: "USER_NAME",
      key: "USER_NAME",
      render: (text, { ID }) => (
        <button
          type="button"
          className="name"
          onClick={() => setIsViewDetails({ active: true, id: ID })}
        >
          {text}
        </button>
      )
    },
    {
      title: "Correo",
      dataIndex: "EMAIL",
      key: "EMAIL",
      render: (text) => <Text>{text}</Text>
    },
    {
      title: "Teléfono",
      key: "PHONE",
      dataIndex: "PHONE",
      render: (text) => <Text>{text}</Text>
    },
    {
      title: "Rol",
      key: "ROL_NAME",
      dataIndex: "ROL_NAME",
      render: (text) => <Text>{text}</Text>
    },
    {
      title: "Clientes",
      key: "COUTN_CLIENTS",
      dataIndex: "COUTN_CLIENTS",
      render: (text) => <Text className="cell -clients">{text}</Text>
    },
    {
      title: "Zona",
      key: "USER_ZONES",
      dataIndex: "USER_ZONES",
      width: "120px",
      render: (arr) =>
        arr ? (
          arr.map((zone: UserZone) => (
            <Text className="cell -zone" key={zone.ZONE_ID}>
              {zone.ZONE_DESCRIPTION}
            </Text>
          ))
        ) : (
          <Text>-</Text>
        )
    },
    {
      title: "Responsabilidad",
      key: "BUSSINES_RULES",
      dataIndex: "BUSSINES_RULES",
      width: "210px",
      render: (arr) =>
        arr ? (
          <div className="responsabilityCell">
            {arr.map((channel: IBusinessRules, index: number) => (
              <Text
                className="cell -individualResponsability"
                key={`${index}${channel.CHANNEL_ID}`}
              >
                {channel.CHANNEL_DESCRIPTION}
              </Text>
            ))}
          </div>
        ) : (
          <Text>-</Text>
        )
    },
    {
      title: "Estado",
      key: "status",
      width: "150px",
      dataIndex: "status",
      render: (_, { ACTIVE, EMAIL }) => (
        <>
          {ACTIVE ? (
            <Flex align="center" className={ACTIVE ? "statusContainer" : "statusContainerPending"}>
              <div className={ACTIVE ? "statusActive" : "statusPending"} />
              <Text>{ACTIVE ? "Activo" : "Inactivo"}</Text>
            </Flex>
          ) : (
            <Popconfirm
              placement="topRight"
              title={"Invitación pendiente de aprobación"}
              description={"Volver a Enviar invitacion?"}
              okText="Si"
              cancelText="No"
              onConfirm={() => onResendInvitation(EMAIL)}
            >
              <Flex
                align="center"
                className={ACTIVE ? "statusContainer" : "statusContainerPending"}
              >
                <div className={ACTIVE ? "statusActive" : "statusPending"} />
                <Text>{ACTIVE ? "Activo" : "Inactivo"}</Text>
              </Flex>
            </Popconfirm>
          )}
        </>
      )
    },
    {
      title: "",
      key: "seeProject",
      width: "40px",
      dataIndex: "",
      render: (_, { ID }) => (
        <Button
          className="buttonSeeProject"
          onClick={() => setIsViewDetails({ active: true, id: ID })}
          icon={<Eye size={"1.3rem"} />}
        />
      )
    }
  ];

  const [selectedUsers, setSelectedUsers] = useState({
    zones: [] as any,
    roles: [] as any,
    status: "all" as "all" | "active" | "inactive",
    channel: [] as { id: number; name: string }[],
    line: [] as { id: number; name: string }[],
    subline: [] as { id: number; name: string }[]
  });

  const { data, loading, mutate } = useUsers({
    idProject,
    page: 1,
    rolesId: selectedUsers.roles,
    zonesId: selectedUsers.zones,
    activeUsers: selectedUsers.status,
    channel: selectedUsers.channel,
    line: selectedUsers.line,
    subline: selectedUsers.subline
  });

  const onCreateUser = async () => {
    setIsViewDetails({ active: false, id: 0 });
    setIsCreateUser(true);
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRow: any) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRow);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  const deleteUsers = async () => {
    const response = await deleteUsersById(selectedRowKeys as number[], idProject);

    if (response.status === 200) {
      showMessage("success", "Los usuarios seleccionados fueron eliminados correctamente.");
      mutate(`/user/project/${idProject}?page=1`);
    } else {
      showMessage("error", "Oops, hubo un error por favor intenta mas tarde.");
    }
    setSelectedRowKeys([]);
    setIsOpenModalRemove(false);
    return selectedRows;
  };

  const onResendInviteSelectedUsers = async () => {
    const response = await resendInvitationUsers(selectedRowKeys as number[]);

    if (response.status === 200) {
      showMessage("success", "Invitación reenviada correctamente.");
    } else {
      showMessage("error", "Oops, hubo un error por favor intenta mas tarde.");
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <Button className="buttonOutlined" onClick={onResendInviteSelectedUsers}>
          Reenviar invitación
        </Button>
      )
    },
    {
      key: "2",
      label: (
        <Button className="buttonOutlined" onClick={() => setIsOpenModalRemove(true)}>
          Eliminar
        </Button>
      )
    }
  ];
  return (
    <>
      <main className="mainUsersProjectTable">
        <Flex justify="space-between" className="mainUsersProjectTable_header">
          <Flex gap={"0.625rem"} align="center">
            <FilterUsers setSelectedUsers={setSelectedUsers} idProject={idProject} />
            <DotsDropdown items={items} />
          </Flex>
          <Button
            type="primary"
            className="buttonNewProject"
            size="large"
            onClick={onCreateUser}
            icon={<Plus weight="bold" size={15} />}
          >
            Nuevo Usuario
          </Button>
        </Flex>
        {loading ? (
          <Flex style={{ height: "30%" }} align="center" justify="center">
            <Spin size="large" />
          </Flex>
        ) : (
          <Table
            className="usersTable"
            pagination={{
              itemRender: (page, type, originalElement) => {
                if (type === "prev") {
                  return <Triangle size={"0.8rem"} weight="fill" />;
                } else if (type === "next") {
                  return <Triangle size={"0.8rem"} weight="fill" />;
                }
                return originalElement;
              }
            }}
            columns={columns}
            dataSource={data.map((data) => ({ ...data, key: data.ID }))}
            rowSelection={rowSelection}
            rowClassName={(record) =>
              selectedRowKeys.includes(record.ID) ? "selectedRow" : "regularRow"
            }
          />
        )}
        <ModalRemove
          isMassiveAction={true}
          name="usuarios"
          isOpen={isOpenModalRemove}
          onClose={() => setIsOpenModalRemove(false)}
          onRemove={deleteUsers}
        />
      </main>
    </>
  );
};
