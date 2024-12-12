"use client";
import { Flex, message } from "antd";
import UiSearchInput from "@/components/ui/search-input/search-input";
import AceptCarrierView from "./view/AceptCarrierView/AceptCarrierView";
import styles from "./AceptCarrier.module.scss";
import { getAceptCarrierRequestList } from "@/services/logistics/acept_carrier";
import { useEffect, useState } from "react";
import { FilterProjects } from "@/components/atoms/Filters/FilterProjects/FilterProjects";
import Container from "@/components/atoms/Container/Container";
import { CarrierCollapseAPI } from "@/types/logistics/carrier/carrier";

export default function AceptCarrier() {
  const [carriers, setCarriers] = useState<CarrierCollapseAPI[]>([]);
  const [filteredCarriers, setFilteredCarriers] = useState<CarrierCollapseAPI[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectFilters, setSelectFilters] = useState({
    country: [] as string[],
    currency: [] as string[]
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  useEffect(() => {
    const loadCarrierRequestTransferList = async () => {
      setLoading(true);
      try {
        const data = await getAceptCarrierRequestList();
        setCarriers(data);
      } catch (error) {
        if (error instanceof Error) message.error(error.message);
        else message.error("Error al obtener la lista de solicitudes de carga");
        console.error("Error loading transfer requests", error);
      } finally {
        setLoading(false);
      }
    };
    loadCarrierRequestTransferList();
  }, []);

  useEffect(() => {
    // Filtrar los resultados cada vez que cambia el término de búsqueda
    if (searchTerm.trim() === "") {
      setFilteredCarriers(carriers);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = carriers
        .map((carrier) => ({
          ...carrier,
          carrierrequests: carrier.carrierrequests.filter(
            (request) =>
              request.id_transfer_request.toString().includes(lowercasedTerm) ||
              request.end_location.toLowerCase().includes(lowercasedTerm) ||
              request.start_location.toLowerCase().includes(lowercasedTerm) ||
              request.vehicles.toLowerCase().includes(lowercasedTerm)
          )
        }))
        .filter((carrier) => carrier.carrierrequests.length > 0);
      setFilteredCarriers(filtered);
    }
  }, [searchTerm, carriers]);

  return (
    <Container>
      <Flex className={styles.filters} gap={8} style={{ marginBottom: "0.5rem" }}>
        <UiSearchInput
          placeholder="Buscar"
          onChange={(event) => {
            setSearchTerm(event.target.value);
          }}
        />
        <FilterProjects setSelecetedProjects={setSelectFilters} height="48" />
      </Flex>
      <AceptCarrierView carriers={filteredCarriers} loading={loading} />
    </Container>
  );
}
