import { useEffect, useState } from "react";
import { Button, Flex, Table, Typography } from "antd";
import type { TableProps } from "antd";
import { DotsThree, Eye, Triangle } from "phosphor-react";
import "./contractTable.scss"; 
import UiSearchInput from "@/components/ui/search-input";

const { Text } = Typography;

export const ContractsTable = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [datasource, setDatasource] = useState<any[]>([]);

  // Datos de ejemplo para contratos
  const exampleContracts = [
    {
      id: 1,
      contractNumber: "C12345",
      client: "Cliente A",
      status: "Activo",
      startDate: "2023-01-01",
      endDate: "2024-01-01"
    },
    {
      id: 2,
      contractNumber: "C67890",
      client: "Cliente B",
      status: "Inactivo",
      startDate: "2022-05-15",
      endDate: "2023-05-15"
    },
    {
      id: 3,
      contractNumber: "C11223",
      client: "Cliente C",
      status: "Activo",
      startDate: "2023-03-10",
      endDate: "2024-03-10"
    }
  ];

  useEffect(() => {
    const data = exampleContracts.filter((contract) => {
      if (!search) return true;
      return (
        contract.client.toLowerCase().includes(search.toLowerCase()) ||
        contract.contractNumber.toLowerCase().includes(search.toLowerCase())
      );
    }).map((contract) => ({
      id: contract.id,
      contractNumber: contract.contractNumber,
      client: contract.client,
      status: contract.status,
      startDate: contract.startDate,
      endDate: contract.endDate
    }));
    
    setDatasource(data);
  }, [search]);

  const onChangePage = (pagePagination: number) => {
    setPage(pagePagination);
  };

  const columns: TableProps<any>["columns"] = [
    {
      title: "Número de Contrato",
      dataIndex: "contractNumber",
      key: "contractNumber"
    },
    {
      title: "Cliente",
      dataIndex: "client",
      key: "client"
    },
    {
      title: "Estado",
      key: "status",
      render: (_, { status }) => (
        <Flex>
          <Flex align="center" className={status === "Activo" ? "statusContainerActive" : "statusContainerInactive"}>
            <div className={status === "Activo" ? "statusActive" : "statusInactive"} />
            <Text>{status}</Text>
          </Flex>
        </Flex>
      )
    },
    {
      title: "Fecha de Inicio",
      dataIndex: "startDate",
      key: "startDate"
    },
    {
      title: "Fecha de Fin",
      dataIndex: "endDate",
      key: "endDate"
    },
    {
      title: "",
      key: "buttonSee",
      width: "54px",
      render: (_, { id }) => (
        <Button
          href={`/logistics/contracts/${id}`}
          className="icon-detail"
          icon={<Eye size={20} />}
        />
      )
    }
  ];

  return (
    <div className="mainContractsTable">
      <Flex justify="space-between" className="mainContractsTable_header">
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
            href="/logistics/contracts/new"
            icon={<DotsThree size={"1.5rem"} />}
          />
        </Flex>
      </Flex>
      <Table
        scroll={{ y: "61dvh", x: undefined }}
        columns={columns}
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
