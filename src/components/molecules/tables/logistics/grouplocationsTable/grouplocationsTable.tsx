import { useEffect, useState } from "react";
import { Button, Flex, message, Spin, Table, Typography } from "antd";
import type { TableProps } from "antd";
import { DotsThree, Eye, Plus, Triangle } from "phosphor-react";
import "./grouplocationsTable.scss";
import UiSearchInput from "@/components/ui/search-input";
import { IGroupLocation } from "@/types/logistics/schema";
import { getAllGroupByLocation } from "@/services/logistics/locations";
import useSWR from "swr";

const { Text } = Typography;

export const GroupLocationsTable = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [datasource, setDatasource] = useState<any[]>([]);

  const { data: grouplocations, isLoading } = useSWR({}, getAllGroupByLocation, {
    onError: (error: any) => {
      console.error(error);
      message.error(error.message);
    },
    refreshInterval: 30000
  });

  const onChangePage = (pagePagination: number) => {
    setPage(pagePagination);
  };

  useEffect(() => {
    const data =
      grouplocations
        ?.filter((element: any) => {
          if (!search) return true;
          return element.description.toLowerCase().includes(search.toLowerCase());
        })
        .map((element: any) => ({
          id: element.id,
          description: element.description,
          active: element.active
        })) || [];
    setDatasource(data);
  }, [grouplocations, search]);

  const columns: TableProps<IGroupLocation>["columns"] = [
    {
      title: "Código",
      dataIndex: "id",
      key: "id"
    },
    {
      title: "Nombre",
      dataIndex: "description",
      key: "description"
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
        <Button
          href={`/logistics/configuration/grouplocations/${id}`}
          className="icon-detail"
          icon={<Eye size={20} />}
        />
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
          {/* <Button
            className="options"
            href="/logistics/configuration/grouplocations"
            icon={<DotsThree size={"1.5rem"} />}
          /> */}
        </Flex>
        <Flex justify="flex-end">
          <Button
            type="primary"
            className="buttonNewProject"
            size="large"
            href="/logistics/configuration/grouplocations/new"
          >
            Nuevo grupo de ubicaciones
            {<Plus weight="bold" size={14} />}
          </Button>
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
