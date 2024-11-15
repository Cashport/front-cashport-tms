"use client";
import { useEffect, useState } from "react";
import { Button, Flex, Table, Typography } from "antd";
import type { TableProps } from "antd";
import { DotsThree, Eye, Plus, Triangle } from "phosphor-react";
import "./driverTable.scss";
import UiSearchInput from "@/components/ui/search-input";
import { IDrivers } from "@/types/logistics/schema";
import { getAllDrivers } from "@/services/logistics/drivers";
import Link from "next/link";
import useSWR from "swr";

interface Props {
  params: {
    id: string;
  };
}

export const DriverTable = ({ params: { id } }: Props) => {
  const { data: drivers, isLoading } = useSWR({ providerId: id }, getAllDrivers, {
    onError: (error: any) => {
      console.error(error);
    },
    refreshInterval: 30000
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [datasource, setDatasource] = useState<any[]>([]);

  const { Text } = Typography;

  const onChangePage = (pagePagination: number) => {
    setPage(pagePagination);
  };

  useEffect(() => {
    const data =
      drivers
        ?.filter((element: any) => {
          if (!search) return true;
          return (
            element.name.toLowerCase().includes(search.toLowerCase()) ||
            element.last_name.toLowerCase().includes(search.toLowerCase()) ||
            element.document.toLowerCase().includes(search.toLowerCase())
          );
        })
        .map((element: any) => ({ ...element })) || [];
    setDatasource(data);
  }, [drivers, search]);

  const columns: TableProps<IDrivers>["columns"] = [
    {
      title: "Empresa",
      dataIndex: "company",
      key: "company"
    },
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      render: (_, { name, last_name }) => <Text>{name + " " + (last_name || "")}</Text>
    },
    {
      title: "Documento",
      dataIndex: "document",
      key: "document"
    },
    {
      title: "Teléfono",
      dataIndex: "phone",
      key: "phone"
    },
    {
      title: "Correo Electronico",
      dataIndex: "email",
      key: "email"
    },
    {
      title: "Status",
      key: "status",
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
      render: (_, { id: driverId }) => (
        <Link href={`/logistics/providers/${id}/driver/${driverId}`} passHref>
          <Button className="icon-detail" icon={<Eye size={20} />} />
        </Link>
      )
    }
  ];

  return (
    <div className="driversTable">
      <Flex justify="space-between" className="mainProjectsTable_header">
        <Flex gap={"10px"}>
          <UiSearchInput
            className="search"
            placeholder="Buscar"
            onChange={(event) => {
              setTimeout(() => {
                setSearch(event.target.value);
              }, 1000);
            }}
          />
          <Button className="options" icon={<DotsThree size={"1.5rem"} />} />
          <Link href={`/logistics/providers/${id}/driver/new`}>
            <Button type="primary" className="buttonNewProject" size="large">
              Nuevo Conductor
              {<Plus weight="bold" size={14} />}
            </Button>
          </Link>
        </Flex>
      </Flex>
      <Table
        scroll={{ y: "61dvh", x: undefined }}
        columns={columns as TableProps<any>["columns"]}
        loading={isLoading}
        pagination={{
          pageSize: 25,
          showSizeChanger: false,
          onChange: onChangePage,
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
    </div>
  );
};
