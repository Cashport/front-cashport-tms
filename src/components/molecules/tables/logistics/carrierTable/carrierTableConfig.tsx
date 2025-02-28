import { useEffect, useState } from "react";
import { Button, Flex, Table, Typography } from "antd";
import type { TableProps } from "antd";
import { DotsThree, Eye, Plus, Triangle } from "phosphor-react";
import "./carrierTable.scss";
import UiSearchInput from "@/components/ui/search-input";
import { ICarrier } from "@/types/logistics/schema";
import { getAllCarriers } from "@/services/logistics/carrier";

const { Text } = Typography;

export const CarrierTable = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [drivers, setDrivers] = useState<ICarrier[]>([]);
  const [driversOptions, setDriversOptions] = useState<any>([]);
  const datasource: any[] = [];

  const loadCarriers = async () => {
    const result = await getAllCarriers();
    if (result?.length > 0) {
      const listCarriers: any[] | ((prevState: ICarrier[]) => ICarrier[]) = [];
      const listCarriersOptions: { label: any; value: any }[] = [];

      result.forEach((item: any, index: number) => {
        listCarriers.push(item);
        listCarriersOptions.push({ label: item.name, value: item.id });
      });

      setDrivers(listCarriers);
      setDriversOptions(listCarriersOptions);
    }
  };

  const onChangePage = (pagePagination: number) => {
    setPage(pagePagination);
  };
  useEffect(() => {
    loadCarriers();
  }, []);

  drivers.forEach((element) => {
    datasource.push({
      nit: element.nit,
      name: element.description,
      type: element.carrier_type,
      vehicle: element.vehicles,
      drivers: element.drivers,
      status: element.status.description
    });
  });

  const columns: TableProps<ICarrier>["columns"] = [
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
      key: "type"
    },
    {
      title: "Vehículos",
      dataIndex: "vehicle",
      key: "vehicle"
    },
    {
      title: "Conductores",
      dataIndex: "drivers",
      key: "drivers"
    },
    {
      title: "Estado",
      key: "status",
      className: "tableTitle",
      width: "130px",
      dataIndex: "status",
      render: (_, { status }) => (
        <Flex>
          <Flex
            align="center"
            className={status ? "statusContainerActive" : "statusContainerInactive"}
          >
            <div className={status ? "statusActive" : "statusInactive"} />
            <Text>{status ? "Activo" : "Inactivo"}</Text>
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
        <Button href={`/carrier/${id}`} className="icon-detail" icon={<Eye size={20} />} />
      )
    }
  ];
  return (
    <div className="mainProjectsTable">
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
          {/* <Button
            className="options"
            href="/logistics/providers/provider"
            icon={<DotsThree size={"1.5rem"} />}
          /> */}
          <Button
            type="primary"
            className="buttonNewProject"
            size="large"
            href="/logistics/providers/provider"
          >
            Nuevo Proveedor
            {<Plus weight="bold" size={14} />}
          </Button>
        </Flex>
      </Flex>
      <Table
        scroll={{ y: "61dvh", x: undefined }}
        columns={columns as TableProps<any>["columns"]}
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
