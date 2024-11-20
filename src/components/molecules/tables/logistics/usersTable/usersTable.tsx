import { useEffect, useState } from "react";
import { Button, Flex, message, Spin, Table, Typography } from "antd";
import type { TableProps } from "antd";
import { Eye, Plus, Triangle } from "phosphor-react";
import "./usersTable.scss";
import UiSearchInput from "@/components/ui/search-input";
import { IUser } from "@/types/logistics/schema";
import { getAllUsers } from "@/services/logistics/users";
import useSWR from "swr";
import Link from "next/link";

const { Text } = Typography;

export const UsersTable = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [datasource, setDatasource] = useState<any[]>([]);

  const { data: users, isLoading } = useSWR(
    {
      key: "GetAllUsers"
    },
    getAllUsers,
    {
      onError: (error: any) => {
        console.error(error);
        message.error(error.message);
      },
      refreshInterval: 30000
    }
  );

  const onChangePage = (pagePagination: number) => {
    setPage(pagePagination);
  };

  useEffect(() => {
    const data =
      users?.data?.data
        ?.filter((element: any) => {
          if (!search) return true;
          return (
            element.user_name.toLowerCase().includes(search.toLowerCase()) ||
            element.email.toLowerCase().includes(search.toLowerCase())
          );
        })
        .map((element: any) => ({
          id: element.id,
          email: element.email,
          phone: element.phone,
          user_name: element.user_name,
          active: element.active,
          rol_name: element.rol_name,
          carrier: element.carrier
        })) || [];
    setDatasource(data);
  }, [users, search]);

  const columns: TableProps<IUser>["columns"] = [
    {
      title: "Nombre",
      dataIndex: "user_name",
      key: "user_name"
    },
    {
      title: "Correo",
      dataIndex: "email",
      key: "email"
    },
    {
      title: "Teléfono",
      dataIndex: "phone",
      key: "phone"
    },
    {
      title: "Rol",
      dataIndex: "rol_name",
      key: "rol_name"
    },
    {
      title: "Proveedor",
      dataIndex: "carrier",
      key: "carrier",
      render: (_, { carrier }) => (
        <Flex>
          <Flex align="center">
            <Text key={carrier?.id}>{carrier?.description}</Text>
          </Flex>
        </Flex>
      )
    },
    {
      title: "Estado",
      key: "active",
      className: "tableTitle",
      width: "130px",
      dataIndex: "active",
      render: (_, { active }) => (
        <Flex>
          <Flex
            align="center"
            className={active ? "statusContainerActive" : "statusContainerInactive"}
          >
            <div className={active ? "statusActive" : "statusInactive"} />
            <Text>{active ? "Activo" : "Inactivo"}</Text>
          </Flex>
        </Flex>
      )
    },
    {
      title: "",
      key: "buttonSee",
      width: "54px",
      dataIndex: "",
      render: (_, { id }) => (
        <Link href={`/logistics/configuration/users/${id}`} type="text">
          <Button
            className="icon-detail"
            icon={<Eye size={20} />}
          />
        </Link>
      )
    }
  ];

  return (
    <div className="mainCarrierTable">
      <Flex justify="space-between" className="mainCarrierTable_header">
        <Flex gap={"10px"}>
          <UiSearchInput
            className="search"
            placeholder="Buscar"
            onChange={(event) => {
              setSearch(event.target.value);
            }}
          />
        </Flex>
        <Flex justify="flex-end">
          <Link href="/logistics/configuration/users/new">
            <Button type="primary" className="buttonNewProject" size="large">
              Nuevo usuario
              {<Plus weight="bold" size={14} />}
            </Button>
          </Link>
        </Flex>
      </Flex>
      {!isLoading ? (
        <Table
          scroll={{ y: "61dvh", x: undefined }}
          columns={columns as TableProps<any>["columns"]}
          loading={isLoading}
          pagination={{
            pageSize: 25,
            onChange: onChangePage,
            showSizeChanger: false,
            itemRender: (page, type, originalElement) => {
              if (type === "prev") {
                return <Triangle size={".75rem"} weight="fill" className="prev" />;
              } else if (type === "next") {
                return <Triangle size={".75rem"} weight="fill" className="next" />;
              } else if (type === "page") {
                return <Flex className="pagination">{page}</Flex>;
              }
              return originalElement;
            }
          }}
          dataSource={datasource}
        />
      ) : (
        <Spin />
      )}
    </div>
  );
};
