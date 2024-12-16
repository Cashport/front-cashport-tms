import { useCallback, useEffect, useState } from "react";
import { Button, Flex, message, Table } from "antd";
import { DotsThree, Plus } from "phosphor-react";
import UiSearchInput from "@/components/ui/search-input";
import { columns } from "./columns";
import styles from "./VehiclesRatesTable.module.scss";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { getAllVehiclesRates } from "@/services/logistics/contracts";
import useSWR from "swr";
import { VehicleRate } from "@/types/contracts/contractsTypes";
import ModalCreateVehicleRate from "@/components/molecules/modals/ModalCreateVehiculeRate/ModalCreateVehicleRate";

export const VehiclesRatesTable = () => {
  const [search, setSearch] = useState("");
  const [datasource, setDatasource] = useState<VehicleRate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // Definir `openModal` usando `useCallback`
  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const { data: vehicleRates, isLoading } = useSWR(
    {
      key: "vehicle-rates"
    },
    getAllVehiclesRates,
    {
      onError: (error: any) => {
        console.error(error);
        message.error(error.message);
      },
      refreshInterval: 30000
    }
  );
  useEffect(() => {
    const data =
      vehicleRates?.filter((vehicleRate) => {
        if (!search) return true;
        return (
          vehicleRate?.vehicle?.toLowerCase().includes(search.toLowerCase()) ||
          vehicleRate?.supplier?.toLowerCase().includes(search.toLowerCase())
        );
      }) || [];
    setDatasource(data);
  }, [vehicleRates, search]);

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
          onClick={openModal}
          className={styles.buttonNewContract}
          icon={<Plus size={20} />}
          iconPosition="end"
        >
          Agregar tarifa
        </PrincipalButton>
      </Flex>
      <Table
        scroll={{ y: "61dvh", x: undefined }}
        columns={columns({ openModal })}
        loading={isLoading}
        dataSource={datasource}
      />
      <ModalCreateVehicleRate
        closeModal={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
        key={"Modal"}
      />
    </div>
  );
};
