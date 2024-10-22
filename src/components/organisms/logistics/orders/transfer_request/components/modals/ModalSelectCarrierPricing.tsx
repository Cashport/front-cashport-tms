import styles from "./ModalSelectCarrierPricing.module.scss";
import { sendCarrierRequest } from "@/services/logistics/carrier-request";
import { getTransferRequestPricing } from "@/services/logistics/transfer-request";
import { ITransferRequestJourneyReview } from "@/types/logistics/schema";
import {
  CarriersPricingModal,
  JourneyTripPricing,
  MockedTrip
} from "@/types/logistics/trips/TripsSchema";
import { Checkbox, Flex, message, Modal, Spin, Typography } from "antd";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import CommunityIcon from "../communityIcon/CommunityIcon";
import UiSearchInput from "@/components/ui/search-input";
import { FilterProjects } from "@/components/atoms/Filters/FilterProjects/FilterProjects";
import UiTabs from "@/components/ui/ui-tabs";
import CarrierPriceCard from "./components/CarrierPriceCard/CarrierPriceCard";
import { convertToSendCarrierRequest, getServiceType } from "./utils/utils";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
dayjs.extend(utc);

const { Text } = Typography;
type Props = {
  open: boolean;
  // eslint-disable-next-line no-unused-vars
  handleModalCarrier: (value: boolean) => void;
  // eslint-disable-next-line no-unused-vars
  mutateStepthree: (journey: ITransferRequestJourneyReview[]) => void;
  view: string;
  setView: React.Dispatch<React.SetStateAction<"solicitation" | "vehicles" | "carrier">>;
};
export default function ModalSelectCarrierPricing({
  open,
  handleModalCarrier,
  mutateStepthree,
  view,
  setView
}: Readonly<Props>) {
  const params = useParams();
  const id = parseInt(params.id as string);
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [tripsList, setTripsList] = useState<MockedTrip[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { data, isLoading, isValidating } = useSWR(
    { idTransferRequest: id, open },
    ({ idTransferRequest, open }) =>
      open ? getTransferRequestPricing({ idTransferRequest }) : undefined,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: true,
      revalidateOnMount: false
    }
  );

  useEffect(() => {
    if (tripsList && tripsList.length > 0) {
      setSelectedTripId(tripsList?.[selectedTabIndex]?.trip?.id_trip);
    }
  }, [selectedTabIndex, tripsList]);

  useEffect(() => {
    setSearchTerm("");
  }, [open]);

  useEffect(() => {
    if (data && data.length > 0) {
      setTripsList(
        data.flatMap((journey) =>
          journey.trips.map((trip) => {
            const j = { ...journey, trips: undefined };
            delete j.trips;
            return {
              trip: { ...trip, checked: false },
              journey: j as Omit<JourneyTripPricing, "trips">
            };
          })
        )
      );
    }
  }, [data]);

  const selectedTrip = tripsList[selectedTabIndex];

  const journey = selectedTrip?.journey;

  const filteredPricing =
    selectedTrip?.trip?.carriers_pricing?.filter((pricing) => {
      const { description, fee_description, price } = pricing;
      return (
        (description && description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (fee_description && fee_description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (price && price.toString().includes(searchTerm))
      );
    }) || [];

  const handleSubmitForm = async () => {
    try {
      setIsSubmitting(true);
      const formatedData = convertToSendCarrierRequest(tripsList, id);
      const response = await sendCarrierRequest(formatedData);
      if (response) {
        setIsSubmitting(false);
        handleModalCarrier(false);
        mutateStepthree(response.journey);
        if (view === "vehicles") setView("carrier");
      }
    } catch (error) {
      setIsSubmitting(false);
      if (error instanceof Error) message.error(error.message);
      else message.error("Error al enviar solicitud");
    }
  };

  const handleCheck = (id_carrier_pricing: number, id_carrier: number, isChecked: boolean) => {
    setTripsList((prevTrips) =>
      prevTrips.map((trip) => {
        if (trip.trip.id_trip === selectedTripId) {
          return {
            ...trip,
            trip: {
              ...trip.trip,
              carriers_pricing: trip.trip.carriers_pricing.map((carrier) => {
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
        return trip;
      })
    );
  };

  const handleMasiveCheck = (newState: boolean) => {
    setTripsList((prevTrips) =>
      prevTrips.map((trip) => {
        if (trip.trip.id_trip === selectedTripId) {
          return {
            ...trip,
            trip: {
              ...trip.trip,
              carriers_pricing: trip.trip.carriers_pricing.map((carrier) => {
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
        return trip;
      })
    );
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
  };

  const allSelected = (): boolean => {
    const currentTrip = selectedTrip?.trip;
    return currentTrip?.carriers_pricing?.every((carrier) => carrier.checked);
  };
  const allSelectedInFiltered = (): boolean => {
    return filteredPricing.every((fp) => fp.checked);
  };
  const isConfirmEnabled = () => {
    if (view === "vehicles") {
      return tripsList.every((t) =>
        t.trip.carriers_pricing.some((pricing: CarriersPricingModal) => pricing.checked)
      );
    } else
      return tripsList.some((t) =>
        t.trip.carriers_pricing.some((pricing: CarriersPricingModal) => pricing.checked)
      );
  };

  const indeterminate = filteredPricing.filter((fp) => fp.checked).length > 0 && !allSelected();

  const checkAll = searchTerm === "" ? allSelected() : allSelectedInFiltered();

  return (
    <Modal
      title={<Header />}
      open={open}
      onCancel={() => handleModalCarrier(false)}
      width={686}
      centered
      footer={
        <Footer
          view={view}
          handleCancel={() => handleModalCarrier(false)}
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
              <Text>
                <strong>Origen</strong> {journey?.start_location_desc}
              </Text>
              <Text>
                <strong>Destino</strong> {journey?.end_location_desc}
              </Text>
            </Flex>
          </Flex>
          <UiTabs
            tabs={tripsList.map((mt) => mt.trip.vehicle_type_desc)}
            onTabClick={(index) => setSelectedTabIndex(index)}
            initialTabIndex={0}
            className={styles.scrollableTabsUI}
          />
          <Flex
            justify="space-between"
            gap={24}
            style={{ marginTop: "1rem", marginBottom: "1.5rem" }}
          >
            <UiSearchInput
              className={styles.searchBar}
              placeholder="Buscar"
              onChange={handleSearchChange}
            />
            <FilterProjects setSelecetedProjects={() => {}} height={"48"} />
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
            {filteredPricing?.map((carrier, index) => (
              <CarrierPriceCard
                key={`trip-${selectedTripId}-carrier-${carrier?.id_carrier_pricing}-${index}`}
                carrier={carrier}
                currentTripId={selectedTripId}
                isChecked={carrier?.checked ?? false}
                handleCheck={handleCheck}
              />
            ))}
          </Flex>
        </div>
      )}
    </Modal>
  );
}
