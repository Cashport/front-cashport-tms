"use client";
import { useEffect, useState } from "react";
import { Button, Flex, message, Table } from "antd";
import type { TableProps } from "antd";
import { DotsThree, Eye, Plus, Triangle } from "phosphor-react";
import Link from "next/link";
import "./vehicleTable.scss";
import UiSearchInput from "@/components/ui/search-input";
import { IVehicle } from "@/types/logistics/schema";
import { getAllVehicles } from "@/services/logistics/vehicle";
import useSWR from "swr";
import CustomTag from "@/components/atoms/CustomTag";

type Props = {
  params: {
    id: string;
  };
};
export const VehicleTable = ({ params: { id } }: Props) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [datasource, setDatasource] = useState<any[]>([]);

  const { data: vehicles, error } = useSWR({ id }, ({ id }) => getAllVehicles({ id }), {
    onError: (error) => {
      message.error(error?.message);
    }
  });

  const onChangePage = (pagePagination: number) => {
    setPage(pagePagination);
  };
  useEffect(() => {
    const data =
      vehicles
        ?.filter((element: any) => {
          if (!search) return true;
          return (
            element.plate_number.toLowerCase().includes(search.toLowerCase()) ||
            element.brand.toLowerCase().includes(search.toLowerCase()) ||
            element.vehicle_type.toLowerCase().includes(search.toLowerCase()) ||
            element.model.toLowerCase().includes(search.toLowerCase())
          );
        })
        .map((e: any) => ({ ...e, type: e.vehicle_type, mark: e.brand, plate: e.plate_number })) ||
      [];
    setDatasource(data);
  }, [vehicles, search]);

  const columns: TableProps<IVehicle>["columns"] = [
    {
      title: "Empresa",
      dataIndex: "company",
      key: "company"
    },
    {
      title: "Tipo de Vehículo",
      dataIndex: "type",
      key: "type"
    },
    {
      title: "Marca",
      dataIndex: "mark",
      key: "mark"
    },
    {
      title: "Placa",
      dataIndex: "plate",
      key: "plate"
    },
    {
      title: "Modelo",
      dataIndex: "model",
      key: "model"
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      width: "200px",
      render: (_, { status }) => {
        return (
          <Flex>
            <CustomTag text={status.description} color={status.color} />
          </Flex>
        );
      }
    },
    {
      title: "",
      key: "buttonSee",
      width: "54px",
      dataIndex: "",
      render: (_, { id: vehicleId }) => (
        <Link href={`/logistics/providers/${id}/vehicle/${vehicleId}`} passHref>
          <Button className="icon-detail" icon={<Eye size={20} />} />
        </Link>
      )
    }
  ];
  return (
    <div className="vehiclesTable">
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
          <Link href={`/logistics/providers/${id}/vehicle/new`}>
            <Button type="primary" className="buttonNewProject" size="large">
              Nuevo Vehículo
              {<Plus weight="bold" size={14} />}
            </Button>
          </Link>
        </Flex>
      </Flex>
      <Table
        scroll={{ y: "61dvh", x: undefined }}
        columns={columns as TableProps<any>["columns"]}
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
        rowKey="id"
      />
    </div>
  );
};
