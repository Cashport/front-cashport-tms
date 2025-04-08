"use client";
import { useEffect, useState } from "react";
import { Flex, message } from "antd";

import { getAceptCarrierRequestList } from "@/services/logistics/acept_carrier";
import { useDebounce } from "@/hooks/useSearch";

import UiSearchInput from "@/components/ui/search-input/search-input";
import AceptCarrierView from "./view/AceptCarrierView/AceptCarrierView";
import { FilterProjects } from "@/components/atoms/Filters/FilterProjects/FilterProjects";
import Container from "@/components/atoms/Container/Container";

import { CarrierCollapseAPI } from "@/types/logistics/carrier/carrier";

import styles from "./AceptCarrier.module.scss";

export default function AceptCarrier() {
  const [carriersData, setCarriersData] = useState<CarrierCollapseAPI[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectFilters, setSelectFilters] = useState({
    country: [] as string[],
    currency: [] as string[]
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    const loadCarrierRequestTransferList = async () => {
      setLoading(true);
      try {
        const data = await getAceptCarrierRequestList({
          searchQuery: debouncedSearchQuery
        });
        setCarriersData(data);
      } catch (error) {
        if (error instanceof Error) message.error(error.message);
        else message.error("Error al obtener la lista de solicitudes de carga");
        console.error("Error loading transfer requests", error);
      } finally {
        setLoading(false);
      }
    };
    loadCarrierRequestTransferList();
  }, [debouncedSearchQuery]);

  const getAceptCarrierRequestListByStatusId = async (statusId?: string, newPage?: number) => {
    setLoading(true);
    try {
      const response = await getAceptCarrierRequestList({
        searchQuery: debouncedSearchQuery,
        statusId,
        page: newPage
      });

      if (Array.isArray(response) && response.length > 0) {
        // Nuevo elemento a actualizar
        const updatedItem = response[0];

        setCarriersData((prevState) =>
          prevState.map((item) => (item.statusid === updatedItem.statusid ? updatedItem : item))
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Flex className={styles.filters} gap={8} style={{ marginBottom: "0.5rem" }}>
        <UiSearchInput
          placeholder="Buscar"
          onChange={(event) => {
            setSearchQuery(event.target.value);
          }}
        />
        <FilterProjects setSelecetedProjects={setSelectFilters} height="48" />
      </Flex>
      <AceptCarrierView
        carriers={carriersData}
        loading={loading}
        getAceptCarrierRequestListByStatusId={getAceptCarrierRequestListByStatusId}
      />
    </Container>
  );
}
