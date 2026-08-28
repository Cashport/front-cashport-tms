import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { Flex, message, Modal, Select, Spin, Tag, Typography } from "antd";
import { Trash } from "@phosphor-icons/react";
import { List } from "react-window";
import { AutoSizer } from "react-virtualized-auto-sizer";

import { getTransferRequestPricing } from "@/services/logistics/transfer-request";
import { getAllCarriers } from "@/services/logistics/users";
import {
  sendTenderProposalToCarriers,
  sendTercerizationProposalToCarriers
} from "@/services/logistics/carrier-request";
import { useDebounce } from "@/hooks/useDeabouce";
import { getServiceType } from "./utils/utils";

import CommunityIcon from "../communityIcon/CommunityIcon";
import UiTabs from "@/components/ui/ui-tabs";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import CommunityTag from "../communityTag/communityTag";

import { JourneyTripPricing, ServiceTab, serviceType } from "@/types/logistics/trips/TripsSchema";
import { ICreateCarrierRequestAuctionBody } from "@/types/logistics/carrier/carrier";

import styles from "./ModalSelectCarrierPricing.module.scss";

const { Text } = Typography;

interface SelectedCarrier {
  carrierId: number;
  carrierName: string;
  vehicleTypeId?: number;
  serviceType: "trip" | "other_requirement";
  tripId?: number;
  otherRequirementId?: number;
}

type Props = {
  open: boolean;
  handleModalTender: (value: boolean) => void;
  type: "tender" | "tercerization";
};

export default function ModalSelectTender({ open, handleModalTender, type }: Readonly<Props>) {
  const params = useParams();
  const id = parseInt(params.id as string);
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  const [tripsList, setTripsList] = useState<ServiceTab[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedCarriersByTrip, setSelectedCarriersByTrip] = useState<
    Record<number, SelectedCarrier[]>
  >({});

  const { data: carriersData, isLoading: isLoadingCarriers } = useSWR(
    "getAllCarriers",
    getAllCarriers,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  const { data, isLoading, isValidating } = useSWR(
    open ? `/transfer-request/pricing/${id}` : null,
    () => getTransferRequestPricing({ idTransferRequest: id }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false
    }
  );

  useEffect(() => {
    if (data && data.length > 0) {
      setTripsList(
        data.flatMap((journey) => {
          // Clone journey and remove trips and other_requirements properties
          const j = { ...journey, trips: undefined, other_requirements: undefined };
          delete j.trips;
          delete j.other_requirements;

          // Combine trips and other_requirements into a single array with type distinction
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

          // Combine both arrays
          return [...tripsData, ...otherRequirementsData];
        })
      );
    }
  }, [data]);

  useEffect(() => {
    if (!open) {
      setSelectedCarriersByTrip({});
      setSelectedTabIndex(0);
    }
  }, [open]);

  const selectedTrip = tripsList[selectedTabIndex];
  const journey = selectedTrip?.journey;

  const isConfirmEnabled = () => {
    return Object.values(selectedCarriersByTrip).some((carriers) => carriers.length > 0);
  };

  const tabsTitles = tripsList.map((tab) => {
    if (tab.service.type === "other_requirement")
      return `${tab.service?.service_description} (${tab.service?.units})`;
    return tab.service?.service_description;
  });

  // Filter available carriers for current trip (excluding already selected ones in this tab).
  // Memoizado: evita recomputar 11k filter cada render del Select.
  const availableCarriers = useMemo(() => {
    if (!selectedTrip) return carriersData?.data ?? [];
    const tripId = selectedTrip.service.id;
    const currentSelections = selectedCarriersByTrip[tripId] || [];
    const selectedSet = new Set(currentSelections.map((c) => c.carrierId));
    return (carriersData?.data ?? []).filter((carrier) => !selectedSet.has(carrier.id));
  }, [carriersData, selectedCarriersByTrip, selectedTrip]);

  // Opciones memoizadas con el label en minúsculas precomputado (searchLabel) para que
  // filterOption NO haga toLowerCase() por cada opción en cada pulsación.
  const carrierOptions = useMemo(
    () =>
      availableCarriers.map((carrier) => ({
        label: carrier.business_name,
        value: carrier.id,
        searchLabel: (carrier.business_name ?? "").toLowerCase()
      })),
    [availableCarriers]
  );

  // Estado controlado del input de búsqueda + debounce 1s.
  // El texto se ve al instante en el campo, pero la lista se filtra 1s después de la última tecla.
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 1000);

  // Filtro optimizado: estable por referencia cuando el debounced no cambia,
  // salta el trabajo si el término tiene < 3 letras, y evita el toLowerCase() por iteración
  // gracias a searchLabel. Lee `debouncedSearch` (no el `input` en vivo de AntD).
  const filterOption = useCallback(
    (_input: string, option?: { searchLabel?: string }) => {
      const term = debouncedSearch.trim();
      if (term.length < 3) return true; // sin filtro hasta 3 caracteres
      return (option?.searchLabel ?? "").includes(term.toLowerCase());
    },
    [debouncedSearch]
  );

  const handleSelectCarrier = (carrierId: number) => {
    const carrier = carriersData?.data?.find((c) => c.id === carrierId);
    if (!carrier || !selectedTrip) return;

    const serviceId = selectedTrip.service.id;
    const vehicleTypeId = selectedTrip.service.service_id;
    const serviceType = selectedTrip.service.type;
    const currentSelections = selectedCarriersByTrip[serviceId] || [];

    setSelectedCarriersByTrip({
      ...selectedCarriersByTrip,
      [serviceId]: [
        ...currentSelections,
        {
          carrierId: carrier.id,
          carrierName: carrier.business_name,
          vehicleTypeId: vehicleTypeId,
          serviceType: serviceType,
          tripId: serviceType === "trip" ? serviceId : undefined,
          otherRequirementId: serviceType === "other_requirement" ? serviceId : undefined
        }
      ]
    });
  };

  const handleRemoveCarrier = (tripId: number, carrierId: number) => {
    const currentSelections = selectedCarriersByTrip[tripId] || [];
    setSelectedCarriersByTrip({
      ...selectedCarriersByTrip,
      [tripId]: currentSelections.filter((c) => c.carrierId !== carrierId)
    });
  };

  const handleSubmitForm = async () => {
    if (!data) return;
    setIsSubmitting(true);

    const auctions: ICreateCarrierRequestAuctionBody["auctions"] = [];

    Object.entries(selectedCarriersByTrip).forEach(([serviceId, carriers]) => {
      carriers.forEach((carrier) => {
        if (carrier.serviceType === "trip") {
          auctions.push({
            carrierId: carrier.carrierId,
            vehicleTypeId: carrier.vehicleTypeId,
            tripId: carrier.tripId!
          });
        } else {
          auctions.push({
            carrierId: carrier.carrierId,
            otherRequirementId: carrier.otherRequirementId!
          });
        }
      });
    });

    const auctionBody: ICreateCarrierRequestAuctionBody = {
      auctions,
      transferRequestId: id
    };

    try {
      if (type === "tender") {
        await sendTenderProposalToCarriers(auctionBody);
      } else {
        await sendTercerizationProposalToCarriers(auctionBody);
      }
      handleModalTender(false);
      message.success("Solicitudes enviadas");
    } catch (error) {
      message.error("Error al enviar solicitudes");
    }
    setIsSubmitting(false);
  };

  const currentTripSelections = selectedTrip
    ? selectedCarriersByTrip[selectedTrip.service.id] || []
    : [];

  return (
    <Modal
      title={
        <Header
          title={type === "tender" ? "Licitación" : "Tercerización"}
          description={
            type === "tender"
              ? "Seleccione los proveedores a los que enviará la solicitud para licitar"
              : "Seleccione los proveedores a los que enviará la solicitud de tercerización"
          }
        />
      }
      open={open}
      onCancel={() => handleModalTender(false)}
      width={686}
      centered
      footer={
        <Footer
          view={"carrier"}
          handleCancel={() => handleModalTender(false)}
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
          <Flex vertical gap={16} style={{ margin: "1.5rem 0" }}>
            <Select
              placeholder="Seleccionar Proveedor"
              size="large"
              className={styles.selectCarrier}
              onChange={handleSelectCarrier}
              value={null}
              options={carrierOptions}
              disabled={availableCarriers.length === 0 || isLoadingCarriers}
              showSearch
              searchValue={searchInput}
              onSearch={setSearchInput}
              filterOption={filterOption}
            />

            {currentTripSelections.length > 0 && (
              <div className={styles.virtualListContainer}>
                <AutoSizer
                  renderProp={({ height, width }) => (
                    <List
                      style={{ height: height ?? 400, width: width ?? 600 }}
                      rowCount={currentTripSelections.length}
                      rowHeight={48}
                      rowKey={(index) =>
                        `${selectedTrip?.service.id ?? 0}-${currentTripSelections[index]?.carrierId}-${index}`
                      }
                      rowProps={{
                        selections: currentTripSelections,
                        serviceId: selectedTrip.service.id,
                        handleRemoveCarrier
                      }}
                      rowComponent={({ index, style, selections, serviceId, handleRemoveCarrier: hc }) => {
                        const carrier = selections[index];
                        return (
                          <div style={style}>
                            <Flex
                              align="center"
                              justify="space-between"
                              style={{
                                padding: "8px",
                                borderRadius: "4px",
                                backgroundColor: "#F7F7F7",
                                minHeight: "40px"
                              }}
                            >
                              <Flex align="center" gap={8}>
                                <Text strong>{carrier.carrierName}</Text>
                              </Flex>
                              <Trash
                                color="#141414"
                                size={20}
                                style={{ cursor: "pointer", marginRight: "4px", flexShrink: 0 }}
                                onClick={() => hc(serviceId, carrier.carrierId)}
                              />
                            </Flex>
                          </div>
                        );
                      }}
                    />
                  )}
                />
              </div>
            )}
          </Flex>
        </div>
      )}
    </Modal>
  );
}
