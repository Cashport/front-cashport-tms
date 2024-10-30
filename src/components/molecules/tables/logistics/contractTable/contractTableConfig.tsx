import { useEffect, useState } from "react";
import { Button, Flex, Table, Typography } from "antd";
import type { TableProps } from "antd";
import { DotsThree, Eye, Plus, Triangle } from "phosphor-react";
import "./contractTable.scss";
import UiSearchInput from "@/components/ui/search-input";


interface IContract {
  id: number;
  name: string;
  start_date: string; 
  end_date: string;
  amount: number; 
  consumed: number; 
  object: string;
  active: boolean;
}

const { Text } = Typography;

export const ContractsTable = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [contracts, setContracts] = useState<IContract[]>([]);

  // Datos de ejemplo para contratos
  const exampleContracts: IContract[] = [
    {
      id: 1,
      name: "Contrato 1",
      start_date: "2024-01-01",
      end_date: "2024-12-31",
      amount: 10000,
      consumed: 25,
      object: "Servicio A",
      active: true
    },
    {
      id: 2,
      name: "Contrato 2",
      start_date: "2024-02-01",
      end_date: "2024-11-30",
      amount: 20000,
      consumed: 50,
      object: "Servicio B",
      active: false
    },
    {
      id: 3,
      name: "Contrato 3",
      start_date: "2024-03-01",
      end_date: "2024-10-31",
      amount: 15000,
      consumed: 10,
      object: "Servicio C",
      active: true
    }
  ];

  const onChangePage = (pagePagination: number) => {
    setPage(pagePagination);
  };

  useEffect(() => {
    setContracts(exampleContracts);
  }, []);

  const datasource = contracts.map((contract) => ({
    id: contract.id,
    name: contract.name,
    startDate: contract.start_date,
    endDate: contract.end_date,
    amount: contract.amount,
    consumed: `${contract.consumed}%`,
    object: contract.object,
    status: contract.active ? "Activo" : "Inactivo"
  }));

  const columns: TableProps<any>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id"
    },
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Desde",
      dataIndex: "startDate",
      key: "startDate"
    },
    {
      title: "Hasta",
      dataIndex: "endDate",
      key: "endDate"
    },
    {
      title: "Monto",
      dataIndex: "amount",
      key: "amount"
    },
    {
      title: "Consumido",
      dataIndex: "consumed",
      key: "consumed"
    },
    {
      title: "Objeto",
      dataIndex: "object",
      key: "object"
    },
    {
      title: "Estado",
      key: "status",
      width: "130px",
      dataIndex: "status",
      render: (status) => ( 
        <Flex>
          <Flex align="center" className={status === "Activo" ? "statusContainerActive" : "statusContainerInactive"}>
            <div className={status === "Activo" ? "statusActive" : "statusInactive"} />
            <Text>{status}</Text>
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
        <Button href={`/contract/${id}`} className="icon-detail" icon={<Eye size={20} />} />
      )
    }
  ];

  return (
    <div className="mainContractsTable">
      <Flex justify="space-between" className="mainContractsTable_header">
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
          <Button
            type="primary"
            className="buttonNewContract"
            size="large"
            href="/contracts/new"
          >
            Nuevo Contrato
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
