import { useEffect, useState } from "react";
import { Button, Flex, Table } from "antd";
import { DotsThree, Plus, Triangle } from "phosphor-react";
import UiSearchInput from "@/components/ui/search-input";
import { mockedVehicleRates } from "./mocked-data";
import { columns } from "./columns";
import styles from "./VehiclesRatesTable.module.scss";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";

export interface VehicleRate {
  vehicleRateId: number;
  sapDescription: string;
  provider: string;
  vehicle: string;
  rateType: string;
  from: string;
  to: string;
  value: number;
  originLocation: string;
}

export const VehiclesRatesTable = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [datasource, setDatasource] = useState<any[]>([]);

  useEffect(() => {
    const data = mockedVehicleRates
      .filter((vehicleRate) => {
        if (!search) return true;
        return (
          vehicleRate.sapDescription.toLowerCase().includes(search.toLowerCase()) ||
          vehicleRate.rateType.toLowerCase().includes(search.toLowerCase()) ||
          vehicleRate.provider.toLowerCase().includes(search.toLowerCase()) ||
          vehicleRate.vehicle.toLowerCase().includes(search.toLowerCase())
        );
      })
      .map((contract) => ({
        ...contract
      }));

    setDatasource(data);
  }, [search]);

  const onChangePage = (pagePagination: number) => {
    setPage(pagePagination);
  };

  return (
    <div className={styles.mainContractsTable}>
      <Flex justify="space-between" className={styles.mainContractsTableHeader}>
        <Flex gap={8}>
          <UiSearchInput
            className={styles.search}
            placeholder="Buscar"
            onChange={(event) => {
              setSearch(event.target.value);
            }}
          />
          <Button
            className={styles.options}
            href="/logistics/contracts/new"
            icon={<DotsThree size={"1.5rem"} />}
          />
        </Flex>
        <PrincipalButton
          onClick={() => console.log("CREAR TARIFA")}
          className={styles.buttonNewContract}
          icon={<Plus size={20} />}
          iconPosition="end"
        >
          Agregar tarifa
        </PrincipalButton>
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
              return <Triangle size={".75rem"} weight="fill" className={styles.prev} />;
            } else if (type === "next") {
              return <Triangle size={".75rem"} weight="fill" className={styles.next} />;
            } else if (type === "page") {
              return <Flex className={styles.pagination}>{page}</Flex>;
            }
            return originalElement;
          }
        }}
        dataSource={datasource}
      />
    </div>
  );
};
