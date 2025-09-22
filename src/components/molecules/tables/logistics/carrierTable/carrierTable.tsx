// "use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Button, Flex, message, Table } from "antd";
import type { TableProps } from "antd";
import { DotsThree, Eye, Plus, Triangle } from "phosphor-react";

import { getAllCarriers, IProvider } from "@/services/logistics/carrier";
import useScreenHeight from "@/components/hooks/useScreenHeight";
import useScreenWidth from "@/components/hooks/useScreenWidth";

import UiSearchInput from "@/components/ui/search-input";
import CustomTag from "@/components/atoms/CustomTag";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";

import "./carrierTable.scss";

export const CarrierTable = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [datasource, setDatasource] = useState<any[]>([]);

  const height = useScreenHeight();
  const width = useScreenWidth();

  const { data: carriers, isLoading } = useSWR(
    {
      key: "carriers"
    },
    getAllCarriers,
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
      carriers
        ?.filter((element: any) => {
          if (!search) return true;
          return (
            element.description.toLowerCase().includes(search.toLowerCase()) ||
            element.nit.toLowerCase().includes(search.toLowerCase())
          );
        })
        .map((element: any) => ({
          id: element.id,
          nit: element.nit,
          name: element.description,
          type: element.carrier_type,
          vehicle: element.vehicles,
          drivers: element.drivers,
          status: element.status
        })) || [];
    setDatasource(data);
  }, [carriers, search]);

  const columns: TableProps<IProvider>["columns"] = [
    {
      title: "NIT",
      dataIndex: "nit",
      key: "nit"
    },
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Tipo",
      dataIndex: "type",
      key: "type",
      width: 125
    },
    {
      title: "Vehículos",
      dataIndex: "vehicle",
      key: "vehicle",
      width: 105
    },
    {
      title: "Conductores",
      dataIndex: "drivers",
      key: "drivers",
      width: 125
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      render: (_, { status }) => {
        return (
          <Flex>
            <CustomTag text={status.name} color={status.color} />
          </Flex>
        );
      },
      width: width && width > 1400 ? 250 : undefined
    },
    {
      title: "",
      key: "buttonSee",
      width: "54px",
      dataIndex: "",
      render: (_, { id }) => (
        <Link href={`/logistics/providers/${id}`}>
          <Button className="icon-detail" icon={<Eye size={20} />} />
        </Link>
      )
    }
  ];

  return (
    <div className="mainCarrierTable">
      <Flex justify="space-between" className="mainCarrierTable_header">
        <Flex gap={8}>
          <UiSearchInput
            className="search"
            placeholder="Buscar"
            onChange={(event) => {
              setSearch(event.target.value);
            }}
          />
          <Button
            className="options"
            href="/logistics/providers/provider"
            icon={<DotsThree size={"1.5rem"} />}
          />
        </Flex>
        <div style={{ height: "48px" }}>
          <Link href="/logistics/providers/provider">
            <PrincipalButton customStyles={{ height: "100%" }}>
              Nuevo Proveedor <Plus size={16} />
            </PrincipalButton>
          </Link>
        </div>
      </Flex>
      <Table
        scroll={{ y: height ? height - 400 : undefined }}
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
