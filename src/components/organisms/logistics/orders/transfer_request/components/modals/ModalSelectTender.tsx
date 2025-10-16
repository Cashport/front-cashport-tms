import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { Flex, Modal, Select, Spin, Tag, Typography } from "antd";
import { Trash } from "@phosphor-icons/react";

import { getTransferRequestPricing } from "@/services/logistics/transfer-request";
import { getServiceType } from "./utils/utils";

import CommunityIcon from "../communityIcon/CommunityIcon";
import UiTabs from "@/components/ui/ui-tabs";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import CommunityTag from "../communityTag/communityTag";

import {
  JourneyTripPricing,
  ServiceTab,
  serviceType
} from "@/types/logistics/trips/TripsSchema";
import { CreateCarrierRequestAuctionBody } from "@/types/logistics/carrier/carrier";

import styles from "./ModalSelectCarrierPricing.module.scss";

const { Text } = Typography;

// Mock data for carriers
const MOCK_CARRIERS = [
  { id: 1, name: "COLTANQUES SAS", vehicleTypeId: 350 },
  { id: 2, name: "ENTRAPETROL", vehicleTypeId: 350 },
  { id: 3, name: "TRANSPORTES ABC", vehicleTypeId: 350 },
  { id: 4, name: "LOGÍSTICA DEL SUR", vehicleTypeId: 350 },
  { id: 5, name: "RUTAS COLOMBIANAS", vehicleTypeId: 350 }
];

interface SelectedCarrier {
  carrierId: number;
  carrierName: string;
  vehicleTypeId: number;
}

type Props = {
  open: boolean;
  // eslint-disable-next-line no-unused-vars
  handleModalTender: (value: boolean) => void;
  // eslint-disable-next-line no-unused-vars
  view: string;
};

export default function ModalSelectTender({
  open,
  handleModalTender,
  view
}: Readonly<Props>) {
  const params = useParams();
  const id = parseInt(params.id as string);
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  const [tripsList, setTripsList] = useState<ServiceTab[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedCarriersByTrip, setSelectedCarriersByTrip] = useState<
    Record<number, SelectedCarrier[]>
  >({});

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
    return Object.values(selectedCarriersByTrip).some(
      (carriers) => carriers.length > 0
    );
  };

  const tabsTitles = tripsList.map((tab) => {
    if (tab.service.type === "other_requirement")
      return `${tab.service?.service_description} (${tab.service?.units})`;
    return tab.service?.service_description;
  });

  // Get all selected carrier IDs across all trips
  const getAllSelectedCarrierIds = (): number[] => {
    const allSelectedIds: number[] = [];
    Object.values(selectedCarriersByTrip).forEach((carriers) => {
      carriers.forEach((carrier) => {
        if (!allSelectedIds.includes(carrier.carrierId)) {
          allSelectedIds.push(carrier.carrierId);
        }
      });
    });
    return allSelectedIds;
  };

  // Filter available carriers for current trip (excluding already selected ones)
  const getAvailableCarriers = () => {
    const selectedIds = getAllSelectedCarrierIds();
    return MOCK_CARRIERS.filter((carrier) => !selectedIds.includes(carrier.id));
  };

  const handleSelectCarrier = (carrierId: number) => {
    const carrier = MOCK_CARRIERS.find((c) => c.id === carrierId);
    if (!carrier || !selectedTrip) return;

    const tripId = selectedTrip.service.id;
    const currentSelections = selectedCarriersByTrip[tripId] || [];

    setSelectedCarriersByTrip({
      ...selectedCarriersByTrip,
      [tripId]: [
        ...currentSelections,
        {
          carrierId: carrier.id,
          carrierName: carrier.name,
          vehicleTypeId: carrier.vehicleTypeId
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

    // Build the auction body
    const auctions: CreateCarrierRequestAuctionBody["auctions"] = [];

    Object.entries(selectedCarriersByTrip).forEach(([tripId, carriers]) => {
      carriers.forEach((carrier) => {
        auctions.push({
          carrierId: carrier.carrierId,
          vehicleTypeId: carrier.vehicleTypeId,
          tripId: parseInt(tripId)
        });
      });
    });

    const auctionBody: CreateCarrierRequestAuctionBody = {
      auctions,
      transferRequestId: id
    };

    console.log("Auction Body:", auctionBody);

    setIsSubmitting(false);
    handleModalTender(false);
  };

  const currentTripSelections = selectedTrip
    ? selectedCarriersByTrip[selectedTrip.service.id] || []
    : [];

  return (
    <Modal
      title={
        <Header
          title="Licitación"
          description="Selecciones los proveedores a los que les enviará la solicitud para licitar"
        />
      }
      open={open}
      onCancel={() => handleModalTender(false)}
      width={686}
      centered
      footer={
        <Footer
          view={view}
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
          <Flex vertical gap={16} style={{ marginTop: "1.5rem", padding: "0 1rem" }}>
            <Select
              placeholder="Seleccionar Proveedor"
              style={{ width: "100%" }}
              size="large"
              onChange={handleSelectCarrier}
              value={null}
              options={getAvailableCarriers().map((carrier) => ({
                label: carrier.name,
                value: carrier.id
              }))}
              disabled={getAvailableCarriers().length === 0}
            />

            {currentTripSelections.length > 0 && (
              <Flex vertical gap={8}>
                {currentTripSelections.map((carrier) => (
                  <Flex
                    key={`${selectedTrip?.service.id}-${carrier.carrierId}`}
                    align="center"
                    justify="space-between"
                    style={{
                      padding: "12px 16px",
                      border: "1px solid #d9d9d9",
                      borderRadius: "8px",
                      backgroundColor: "#fafafa"
                    }}
                  >
                    <Flex align="center" gap={8}>
                      <Text strong>{carrier.carrierName}</Text>
                      <Tag color="blue">Nacional</Tag>
                    </Flex>
                    <Trash
                      size={20}
                      style={{ cursor: "pointer", color: "#ff4d4f" }}
                      onClick={() =>
                        handleRemoveCarrier(selectedTrip.service.id, carrier.carrierId)
                      }
                    />
                  </Flex>
                ))}
              </Flex>
            )}
          </Flex>
        </div>
      )}
    </Modal>
  );
}
