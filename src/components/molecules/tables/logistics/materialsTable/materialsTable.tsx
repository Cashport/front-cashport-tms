"use client";
import { useEffect, useState } from "react";
import { Button, Flex, message, Spin, Table, Typography } from "antd";
import type { TableProps } from "antd";
import { Eye, Plus, Triangle } from "phosphor-react";
import "./materialsTable.scss";
import UiSearchInput from "@/components/ui/search-input";
import { IMaterial } from "@/types/logistics/schema";
import { getAllMaterials } from "@/services/logistics/materials";
import useSWR from "swr";
import Link from "next/link";

const { Text } = Typography;

export const MaterialsTable = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [datasource, setDatasource] = useState<any[]>([]);

  const { data: materials, isLoading } = useSWR(
    {
      key: "materials"
    },
    getAllMaterials,
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
      materials?.data?.data
        ?.filter((element: any) => {
          if (!search) return true;
          return element.description.toLowerCase().includes(search.toLowerCase());
        })
        .map((element: any) => ({
          id: element.id,
          code_sku: element.code_sku,
          description: element.description,
          m3_volume: element.m3_volume,
          mt_height: element.mt_height,
          mt_width: element.mt_width,
          mt_length: element.mt_length,
          kg_weight: element.kg_weight,
          active: element.active
        })) || [];
    setDatasource(data);
  }, [materials, search]);

  const columns: TableProps<IMaterial>["columns"] = [
    {
      title: "Código",
      dataIndex: "id",
      key: "id"
    },
    {
      title: "SKU",
      dataIndex: "code_sku",
      key: "code_sku"
    },
    {
      title: "Nombre",
      dataIndex: "description",
      key: "description"
    },
    {
      title: "Volumen",
      dataIndex: "m3_volume",
      key: "m3_volume",
      render: (_, record) => {
        return (record.m3_volume ? record.m3_volume : "") + " m3";
      }
    },
    {
      title: "Alto",
      dataIndex: "mt_height",
      key: "mt_height",
      render: (_, record) => {
        return (record.mt_height ? record.mt_height : "") + " m";
      }
    },
    {
      title: "Ancho",
      dataIndex: "mt_width",
      key: "mt_width",
      render: (_, record) => {
        return (record.mt_width ? record.mt_width : "") + " m";
      }
    },
    {
      title: "Largo",
      dataIndex: "mt_length",
      key: "mt_length",
      render: (_, record) => {
        return (record.mt_length ? record.mt_length : "") + " m";
      }
    },
    {
      title: "Peso",
      dataIndex: "kg_weight",
      key: "kg_weight",
      render: (_, record) => {
        return (record.kg_weight ? record.kg_weight : "") + " kg";
      }
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
        <Link href={`/logistics/configuration/materials/${id}`} type="text">
          <Button className="icon-detail" icon={<Eye size={20} />} />
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
          <Link href="/logistics/configuration/materials/new">
            <Button type="primary" className="buttonNewProject" size="large">
              Nuevo material
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
