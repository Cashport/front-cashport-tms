"use client";
import { Flex } from "antd";
import { useEffect, useState } from "react";

import { useDebounce } from "@/hooks/useSearch";
import { getAllBillingList } from "@/services/billings/billings";

import UiSearchInput from "@/components/ui/search-input/search-input";
import AceptBillingView from "./view/AceptBillingView/AceptBillingView";
import { FilterProjects } from "@/components/atoms/Filters/FilterProjects/FilterProjects";
import Container from "@/components/atoms/Container/Container";

import styles from "./AceptBilling.module.scss";

export default function AceptBilling() {
  const [billings, setBillings] = useState<any[]>([]);
  const [selectFilters, setSelectFilters] = useState({
    country: [] as string[],
    currency: [] as string[]
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadBillingRequestTransferList();
  }, [debouncedSearchQuery]);

  const loadBillingRequestTransferList = async () => {
    setLoading(true);
    const result = await getAllBillingList({
      searchQuery
    });
    setBillings(result);
    setLoading(false);
  };

  return (
    <Container>
      <Flex className={styles.filters} style={{ marginBottom: "0.5rem" }} gap={8}>
        <UiSearchInput
          placeholder="Buscar"
          onChange={(event) => {
            setSearchQuery(event.target.value);
          }}
        />
        <FilterProjects setSelecetedProjects={setSelectFilters} height="48" />
      </Flex>
      <AceptBillingView billings={billings} loading={loading} />
    </Container>
  );
}
