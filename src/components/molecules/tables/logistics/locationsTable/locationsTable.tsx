import { useEffect, useState } from "react";
import { Button, Flex, message, Table, Typography } from "antd";
import type { TableProps } from "antd";
import { Eye, Plus, Triangle } from "phosphor-react";
import "./locationsTable.scss";
import UiSearchInput from "@/components/ui/search-input";
import { ILocation } from "@/types/logistics/schema";
import { getAllLocations } from "@/services/logistics/locations";
import useSWR from "swr";
import Link from "next/link";

const { Text } = Typography;

export const LocationsTable = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [datasource, setDatasource] = useState<any[]>([]);

  const { data: locations, isLoading } = useSWR(
    {
      key: "GetAllLocations"
    },
    getAllLocations,
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
      locations?.data?.data
        ?.filter((element: any) => {
          if (!search) return true;
          return element.description.toLowerCase().includes(search.toLowerCase());
        })
        .map((element: any) => ({
          id: element.id,
          description: element.description,
          citydesc: element.citydesc,
          statedesc: element.statedesc,
          location_type: element.location_type,
          active: element.active
        })) || [];
    setDatasource(data);
  }, [locations, search]);

  const columns: TableProps<ILocation>["columns"] = [
    {
      title: "Nombre",
      dataIndex: "description",
      key: "description"
    },
    {
      title: "Departamento",
      dataIndex: "statedesc",
      key: "statedesc"
    },
    {
      title: "Municipio",
      dataIndex: "citydesc",
      key: "citydesc"
    },
    {
      title: "Tipo de ubicación",
      dataIndex: "location_type",
      key: "location_type"
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
        <Link href={`/logistics/configuration/locations/${id}`} type="text">
          <Button
            href={`/logistics/configuration/locations/${id}`}
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
          <Link href="/logistics/configuration/locations/new">
            <Button type="primary" className="buttonNewProject" size="large">
              Nueva ubicación
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
    </div>
  );
};
