import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { Check } from "phosphor-react";
import { Checkbox, Flex, message, Modal, Spin, Switch, Typography } from "antd";
import { X } from "@phosphor-icons/react";
import { List } from "react-window";
import { AutoSizer } from "react-virtualized-auto-sizer";

import { sendCarrierRequest } from "@/services/logistics/carrier-request";
import { getTransferRequestPricing } from "@/services/logistics/transfer-request";
import { useDebounce } from "@/hooks/useDeabouce";
import { convertToSendCarrierRequest, getServiceType } from "./utils/utils";

import CommunityIcon from "../communityIcon/CommunityIcon";
import UiSearchInput from "@/components/ui/search-input";
import UiTabs from "@/components/ui/ui-tabs";
import CarrierPriceCard from "./components/CarrierPriceCard/CarrierPriceCard";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import CommunityTag from "../communityTag/communityTag";

import { ITransferRequestJourneyReview } from "@/types/logistics/schema";
import {
  CarriersPricingModal,
  JourneyTripPricing,
  ServiceTab,
  serviceType
} from "@/types/logistics/trips/TripsSchema";

import styles from "./ModalSelectCarrierPricing.module.scss";

const { Text } = Typography;
type Props = {
  open: boolean;
  // eslint-disable-next-line no-unused-vars
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  transferRequestId: number;
  mutateStepthree?: (journey: ITransferRequestJourneyReview[]) => void;
  view?: string;
  setView?: React.Dispatch<React.SetStateAction<"solicitation" | "vehicles" | "carrier">>;
  extractCreatedCarriers?: (_: { journey: ITransferRequestJourneyReview[] }) => void;
  useGetPricingComparison?: boolean;
};
export default function ModalSelectCarrierPricing({
  open,
  onClose,
  transferRequestId,
  mutateStepthree,
  view,
  setView,
  extractCreatedCarriers
}: Readonly<Props>) {
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [tripsList, setTripsList] = useState<ServiceTab[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { data, isLoading, isValidating } = useSWR(
    { idTransferRequest: transferRequestId, showAll },
    ({ idTransferRequest, showAll }) => getTransferRequestPricing({ idTransferRequest, showAll }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: true
    }
  );

  useEffect(() => {
    if (tripsList && tripsList.length > 0) {
      setSelectedTripId(tripsList?.[selectedTabIndex]?.service?.id);
    }
  }, [selectedTabIndex, tripsList]);

  useEffect(() => {
    setSearchTerm("");
  }, [open]);

  useEffect(() => {
    if (data && data.length > 0) {
      setTripsList(
        data.flatMap((journey) => {
          // Clonar el journey y eliminar las propiedades trips y other_requirements
          const j = { ...journey, trips: undefined, other_requirements: undefined };
          delete j.trips;
          delete j.other_requirements;

          // Combinar trips y other_requirements en un solo array con distinción de tipo
          const tripsData = journey.trips.map((trip) => ({
            service: {
              id: trip.id_trip,
              service_id: trip.vehicle_type,
              service_description: trip.vehicle_type_desc,
              carriers_pricing: trip.carriers_pricing.map((cp) => ({ ...cp, checked: false })),
              units: null,
              type: "trip" as serviceType
            },
            journey: j as Omit<JourneyTripPricing, "trips" | "other_requirements">
          }));

          const otherRequirementsData = journey.other_requirements.map((requirement) => ({
            service: {
              id: requirement.id,
              service_id: requirement.idRequirement,
              service_description: requirement.descripcion,
              carriers_pricing: requirement.carriers_pricing.map((cp) => ({
                ...cp,
                checked: false
              })),
              units: requirement.units,
              type: "other_requirement" as serviceType
            },
            journey: j as Omit<JourneyTripPricing, "trips" | "other_requirements">
          }));

          // Combinar ambos arrays
          return [...tripsData, ...otherRequirementsData];
        })
      );
    }
  }, [data]);
  const selectedTrip = tripsList[selectedTabIndex];

  const journey = selectedTrip?.journey;

  // Pre-normalize the search haystack once per trip change (11k records → avoid lowercase() per filter iteration)
  const pricingSearchIndex = useMemo(() => {
    const pricings = selectedTrip?.service?.carriers_pricing ?? [];
    return pricings.map((pricing) => ({
      pricing,
      description: pricing?.description?.toLowerCase() ?? "",
      feeDescription: pricing?.fee_description?.toLowerCase() ?? "",
      priceString: pricing?.price != null ? String(pricing.price) : ""
    }));
  }, [selectedTrip?.service?.carriers_pricing]);

  // Debounce del término: la búsqueda solo arranca 1s después de la última pulsación.
  // El guard de 3 letras se evalúa contra el valor debounced para no filtrar con typos intermedios.
  const isSearchActive = searchTerm.length >= 3;
  const debouncedSearchTerm = useDebounce(isSearchActive ? searchTerm : "", 1000);
  const normalizedSearch = debouncedSearchTerm.trim().toLowerCase();

  const filteredPricing = useMemo(() => {
    // Sin término válido (menos de 3 letras) → devolvemos la lista completa sin filtrar
    if (!isSearchActive) {
      return pricingSearchIndex.map((entry) => entry.pricing);
    }

    return pricingSearchIndex
      .filter(
        ({ description, feeDescription, priceString }) =>
          description.includes(normalizedSearch) ||
          feeDescription.includes(normalizedSearch) ||
          priceString.includes(debouncedSearchTerm.trim())
      )
      .map((entry) => entry.pricing);
  }, [pricingSearchIndex, normalizedSearch, debouncedSearchTerm]);

  const postCarrierRequest = async (trips: ServiceTab[], id: number, showAll: boolean) => {
    try {
      setIsSubmitting(true);
      const formatedData = convertToSendCarrierRequest(trips, id, showAll);
      const response = await sendCarrierRequest(formatedData);

      if (response) {
        message.success("Solicitudes enviadas");
        mutateStepthree && mutateStepthree(response.journey);
        extractCreatedCarriers && extractCreatedCarriers(response);
        onClose();
        if (view === "vehicles") setView && setView("carrier");
      }
    } catch (error) {
      if (error instanceof Error) message.error(error.message);
      else message.error("Error al enviar solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasPricingsSelected = () => {
    return tripsList.some((t) =>
      t.service.carriers_pricing.some((pricing: CarriersPricingModal) => pricing.checked)
    );
  };

  const handleSubmitForm = async () => {
    if (view === "vehicles") {
      if (hasPricingsSelected()) {
        await postCarrierRequest(tripsList, transferRequestId, showAll);
      } else {
        setView && setView("carrier");
        onClose();
      }
      return;
    }

    await postCarrierRequest(tripsList, transferRequestId, showAll);
  };

  const handleCheck = useCallback(
    (id_carrier_pricing: number, id_carrier: number, isChecked: boolean) => {
      setTripsList((prev) =>
        prev.map((tab) => {
          if (tab.service.id === selectedTripId) {
            return {
              ...tab,
              service: {
                ...tab.service,
                carriers_pricing: tab.service.carriers_pricing.map((carrier) => {
                  if (
                    carrier.id_carrier_pricing === id_carrier_pricing &&
                    carrier.id_carrier === id_carrier
                  ) {
                    return {
                      ...carrier,
                      checked: !isChecked
                    };
                  }
                  return carrier;
                })
              }
            };
          }
          return tab;
        })
      );
    },
    [selectedTripId]
  );

  const handleMasiveCheck = useCallback(
    (newState: boolean) => {
      setTripsList((prev) =>
        prev.map((tab) => {
          if (tab.service.id === selectedTripId) {
            return {
              ...tab,
              service: {
                ...tab.service,
                carriers_pricing: tab.service.carriers_pricing.map((carrier) => {
                  if (searchTerm !== "") {
                    const isFiltered = filteredPricing.some(
                      (filteredCarrier) =>
                        filteredCarrier.id_carrier_pricing === carrier.id_carrier_pricing
                    );
                    return {
                      ...carrier,
                      checked: isFiltered && newState
                    };
                  } else {
                    return {
                      ...carrier,
                      checked: newState
                    };
                  }
                })
              }
            };
          }
          return tab;
        })
      );
    },
    [selectedTripId, filteredPricing, searchTerm]
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
  };

  const handleShowAll = (checked: boolean) => {
    setShowAll(checked);
  };

  const allSelected = (): boolean => {
    const currentTrip = selectedTrip?.service;
    return currentTrip?.carriers_pricing?.every((carrier) => carrier.checked);
  };
  const allSelectedInFiltered = (): boolean => {
    return filteredPricing.every((fp) => fp.checked);
  };
  const isConfirmEnabled = () => {
    if (view === "vehicles") {
      return true;
    } else
      return tripsList.some((t) =>
        t.service.carriers_pricing.some((pricing: CarriersPricingModal) => pricing.checked)
      );
  };

  const indeterminate = filteredPricing.filter((fp) => fp.checked).length > 0 && !allSelected();

  const checkAll = searchTerm === "" ? allSelected() : allSelectedInFiltered();

  const tabsTitles = tripsList.map((tab) => {
    if (tab.service.type === "other_requirement")
      return `${tab.service?.service_description} (${tab.service?.units})`;
    return tab.service?.service_description;
  });

  return (
    <Modal
      title={
        <Header
          title="Proveedores"
          description="Seleccione los proveedores a los que les enviará la solicitud de los viajes creados"
        />
      }
      open={open}
      onCancel={onClose}
      width={686}
      centered
      footer={
        <Footer
          view={view || ""}
          handleCancel={onClose}
          handleSubmit={handleSubmitForm}
          isSubmitting={isSubmitting}
          disabledContinue={!isConfirmEnabled()}
        />
      }
    >
      {isLoading || isValidating ? (
        <Flex justify="center" align="center" style={{ minHeight: "300px" }}>
          <Spin size="large" />
        </Flex>
      ) : (
        <div className="scrollableTabGlobalCss">
          <Flex gap={8} className={styles.header} vertical align="center">
            <Flex gap={24} align="center" justify="space-between" style={{ width: "100%" }}>
              <Flex gap={8} vertical>
                <Text>
                  <strong>Fecha inicio</strong>{" "}
                  {dayjs
                    .utc(journey?.start_date)
                    .toDate()
                    .toLocaleDateString("es", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "GMT"
                    })
                    ?.replace(",", " -")}
                </Text>
                <Text>
                  <strong>Fecha final</strong>{" "}
                  {dayjs
                    .utc(journey?.end_date)
                    .toDate()
                    .toLocaleDateString("es", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "GMT"
                    })
                    ?.replace(",", " -")}
                </Text>
              </Flex>
              <Flex gap={10}>
                {!!journey?.is_community && (
                  <CommunityIcon communityName={journey?.community_name} withTooltip />
                )}
                <div className={styles.stBox}>
                  {getServiceType(journey?.id_type_service || 0).icon}
                  <Text className={styles.stContent}>
                    {getServiceType(journey?.id_type_service || 0).title}
                  </Text>
                </div>
              </Flex>
            </Flex>
            <Flex gap={8} vertical align="start" style={{ width: "100%" }}>
              <Flex gap={"12px"} align="center">
                <Text>
                  <strong>Origen</strong> {journey?.start_location_desc}
                </Text>
                {journey?.start_group_location_desc && (
                  <CommunityTag name={journey.start_group_location_desc} />
                )}
              </Flex>
              <Flex gap={"12px"} align="center">
                <Text>
                  <strong>Destino</strong> {journey?.end_location_desc}
                </Text>
                {journey?.end_group_location_desc && (
                  <CommunityTag name={journey.end_group_location_desc} />
                )}
              </Flex>
            </Flex>
          </Flex>
          <UiTabs
            tabs={tabsTitles}
            onTabClick={(index) => setSelectedTabIndex(index)}
            initialTabIndex={0}
            className={styles.scrollableTabsUI}
          />
          <Flex gap={20} style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
            <UiSearchInput
              className={styles.searchBar}
              placeholder="Buscar"
              onChange={handleSearchChange}
            />
            <Flex align="center" gap={8}>
              <Switch
                className={styles.switchShowAll}
                style={{ width: "3rem" }}
                checked={showAll}
                checkedChildren={<Check style={{ paddingTop: "5px" }} size={16} />}
                unCheckedChildren={<X style={{ paddingTop: "5px" }} size={16} />}
                onChange={handleShowAll}
              />
              <Text style={{ fontWeight: "400", fontSize: "0.875rem" }}>Mostrar todos</Text>
            </Flex>
          </Flex>
          <Flex vertical gap={8} className={styles.tripCarrierPricing} key={selectedTripId ?? 0}>
            <Checkbox
              style={{ marginLeft: "0.5rem" }}
              onChange={(e) => handleMasiveCheck(e.target.checked)}
              checked={checkAll}
              indeterminate={indeterminate}
            >
              <Text style={{ fontWeight: "500" }}>Seleccionar todos</Text>
            </Checkbox>
            <div className={styles.virtualListContainer}>
              <AutoSizer
                renderProp={({ height, width }) => (
                  <List
                    style={{ height: height ?? 400, width: width ?? 600 }}
                    rowCount={filteredPricing.length}
                    rowHeight={76}
                    rowKey={(index) =>
                      `trip-${selectedTripId ?? 0}-carrier-${filteredPricing[index]?.id_carrier_pricing}-${index}`
                    }
                    rowProps={{
                      carriers: filteredPricing,
                      selectedTripId,
                      serviceType: selectedTrip?.service.type,
                      journey,
                      handleCheck
                    }}
                    rowComponent={({ index, style, carriers, selectedTripId: tripId, serviceType, journey: j, handleCheck: hc }) => {
                      const carrier = carriers[index];
                      return (
                        <div style={style}>
                          <CarrierPriceCard
                            carrier={carrier}
                            currentTripId={tripId}
                            isChecked={carrier?.checked ?? false}
                            handleCheck={hc}
                            type={serviceType}
                            journey={j}
                          />
                        </div>
                      );
                    }}
                  />
                )}
              />
            </div>
          </Flex>
        </div>
      )}
    </Modal>
  );
}
