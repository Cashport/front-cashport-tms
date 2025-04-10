"use client";
import { Button, Col, Drawer, Flex, message, Row, Spin, Typography } from "antd";
import { DotsThree, Truck, CraneTower, User } from "@phosphor-icons/react";
import { getBillingDetailsById } from "@/services/billings/billings";
import styles from "./AceptBillingDetailView.module.scss";
import { useState, useEffect } from "react";
import { NoveltyTable } from "@/components/molecules/tables/NoveltyTable/Novelty";
import ModalBillingAction from "@/components/molecules/modals/ModalBillingAction/ModalBillingAction";
import { IJourney, IIncident } from "@/types/logistics/schema";
import { INovelty, IEvidence } from "@/types/novelty/INovelty";
import { BillingStatusEnum, IBillingDetails } from "@/types/logistics/billing/billing";
import { formatMoney, formatNumber } from "@/utils/utils";
import { BackButton } from "@/components/organisms/logistics/orders/DetailsOrderView/components/BackButton/BackButton";
import { getNoveltyDetail } from "@/services/logistics/novelty";
import { DrawerBody } from "@/components/organisms/logistics/transfer-orders/details/drawer-body/DrawerBody";
import ModalBillingMT from "@/components/molecules/modals/ModalBillingMT/ModalBillingMT";
import { Receipt } from "phosphor-react";
import { Responsibles } from "@/components/organisms/logistics/orders/DetailsOrderView/components/Responsibles/Responsibles";
import { mockedPSL } from "./mockedpds";
import { RequirementHeader } from "@/components/molecules/collapse/Requirementheader/RequirementHeader";

const { Text } = Typography;

interface AceptBillingDetailProps {
  params: { id: string };
}

export default function AceptBillingDetailView({ params }: AceptBillingDetailProps) {
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState<IBillingDetails>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [billingStatus, setBillingStatus] = useState<BillingStatusEnum | null>(null);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [isModalMTVisible, setIsModalMTVisible] = useState(false);
  const [tripId, setTripId] = useState<number | null>(null);

  const canMakeAnAction = billingStatus
    ? billingStatus === BillingStatusEnum.PorAceptar ||
      billingStatus === BillingStatusEnum.Preautorizado
    : false;

  const [messageApi, contextHolder] = message.useMessage();
  const [novelty, setNovelty] = useState<INovelty | null>(null);
  const fetchBillingDetails = async () => {
    try {
      setLoading(true);
      const response = await getBillingDetailsById(params.id);
      if (response?.journeys) {
        setBillingData(response);
        setBillingStatus(response.billing.statusDesc);
      } else {
        console.error("No se encontraron detalles de facturación.");
      }
    } catch (error) {
      console.error("Error fetching billing details:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (params.id && !isModalVisible) fetchBillingDetails();
  }, [params.id, isModalVisible]);

  const TripHeader = ({ trip }: { trip: any }) => (
    <div className={styles.resumContainer} style={{ marginBottom: "1rem" }}>
      <div className={styles.resum}>
        <div className={styles.resumItem}>
          <Text className={styles.text}>Vehículo</Text>
          <Text className={`${styles.text} ${styles.bold}`}>
            {trip.vehicle_type_desc} | {trip.plate_number ?? "N/A"}
          </Text>
        </div>
        <div className={styles.resumItem}>
          <Text className={styles.text}>Proveedor</Text>
          <Text className={`${styles.text} ${styles.bold}`}>
            {billingData?.billing.carrier ?? "N/A"}
          </Text>
        </div>
        <div className={styles.resumItem}>
          <Text className={styles.text}>Conductor</Text>
          <Text className={`${styles.text} ${styles.bold}`}>{trip.drivers ?? "N/A"}</Text>
        </div>
      </div>
      <div className={`${styles.resum} ${styles.right}`}>
        <div className={`${styles.resumItem} ${styles.right}`}>
          <Text className={styles.text}>Tarifa base</Text>
          <Text className={styles.text}>{formatMoney(trip.fare || "0")}</Text>
        </div>
        <div className={`${styles.resumItem} ${styles.right}`}>
          <Text className={styles.text}>Sobrecosto</Text>
          <Text className={styles.text}>{formatMoney(trip.overcost || "0")}</Text>
        </div>
        <div className={`${styles.resumItem} ${styles.right}`}>
          <Text className={`${styles.text} ${styles.bold}`}>Total</Text>
          <Text className={`${styles.text} ${styles.bold}`}>{formatMoney(trip.total || "0")}</Text>
        </div>
      </div>
      <br />
    </div>
  );

  const findNoveltyDetail = async (id: number) => {
    const data = await getNoveltyDetail(id);
    if (Object.keys(data).length) {
      setNovelty(data as INovelty);
    }
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
    setNovelty(null);
  };

  const TitleComponent = ({ id, journey }: { id: number; journey: IJourney }) => {
    const getServiceTypeDescription = (id_service_type: number) => {
      switch (id_service_type) {
        case 1:
          return "Carga";
        case 2:
          return "Izaje";
        case 3:
          return "Personas";
        case 4:
          return "Aéreo";
        default:
          return "Desconocido";
      }
    };

    const getServiceTypeIcon = (id_service_type: number) => {
      switch (id_service_type) {
        case 1:
          return <Truck size={27} color="#FFFFFF" weight="fill" />;
        case 2:
          return <CraneTower size={27} color="#FFFFFF" weight="fill" />;
        case 3:
          return <User size={27} color="#FFFFFF" weight="fill" />;
        case 4:
          return <Truck size={27} color="#FFFFFF" weight="fill" />;
        default:
          return <Truck size={27} color="#FFFFFF" weight="fill" />;
      }
    };

    return (
      <div className={styles.header}>
        <div className={styles.stateContainer}>
          {getServiceTypeIcon(journey.id_type_service)}
          <Text className={styles.state}>{getServiceTypeDescription(journey.id_type_service)}</Text>
        </div>
        <div className={styles.fromto}>
          <div className={styles.fromtoContainer}>
            <Text className={styles.title}>Origen</Text>
            <Text className={styles.subtitle}>{journey.start_location_desc}</Text>
          </div>
          <div className={`${styles.fromtoContainer} ${styles.right}`}>
            <div className={styles.fromtoContainer}>
              <Text className={styles.title}>Destino</Text>
              <Text className={styles.subtitle}>{journey.end_location_desc}</Text>
            </div>
          </div>
        </div>
      </div>
    );
  };

  function convertIncidentToNovelty(incident: IIncident): INovelty {
    const evidence: IEvidence = {
      id: incident.id,
      novelty_id: incident.id,
      name: incident?.url_image?.split("/").pop() || "Evidencia",
      url: incident?.url_image,
      created_at: new Date(),
      updated_at: new Date()
    };

    return {
      id: incident.id,
      trip_id: incident.id_trip,
      novelty_type: incident.incident_type_name,
      observation: incident.description,
      value: incident.fare,
      status: incident.status_description,
      status_id: incident.status,
      created_by: incident.user,
      quantity: incident.units,
      overcost_id: 0,
      unit_value: 0,
      evidences: [evidence]
    };
  }
  const handleOpenMTModal = () => {
    setIsModalMTVisible(true);
  };

  const tripDetailsWithNovelties =
    billingData?.journeys.flatMap((journey: IJourney) => {
      return [
        <TitleComponent key={`title-${journey.id}`} id={journey.id} journey={journey} />,
        ...journey.requirements.flatMap((req, index) => {
          return <RequirementHeader key={`req-${req.id}`} requirement={req} />;
        }),
        ...journey.trips.flatMap((trip, index) => {
          const allIncidents =
            trip.incidents.length > 0 ? trip.incidents.map(convertIncidentToNovelty) : [];

          return (
            <div key={`trip-novelty-container-${trip.id}`} style={{ rowGap: "1rem" }}>
              <TripHeader key={`trip-${trip.id}`} trip={trip} />
              <NoveltyTable
                key={`novelty-table-${trip.id}`}
                novelties={allIncidents}
                openDrawer={() => setOpenDrawer(true)}
                handleShowDetails={(t) => {
                  findNoveltyDetail(t);
                }}
              />
              <Flex vertical justify="flex-end" align="flex-end">
                <Button
                  type="text"
                  onClick={() => {
                    handleOpenMTModal();
                    setTripId(trip.id);
                  }}
                >
                  <Receipt size={20} />
                  <p>Ver MT</p>
                </Button>
              </Flex>
            </div>
          );
        })
      ];
    }) || [];

  return (
    <>
      {contextHolder}

      <div className={styles.card}>
        <div className={styles.linkButtonsContainer}>
          <BackButton
            href="/facturacion"
            title={`Detalle de TR ${billingData?.billing?.idTransferRequest ?? ""}`}
          />
          {canMakeAnAction && (
            <Button
              className={styles.actionBtn}
              type="text"
              size="large"
              onClick={() => setIsModalVisible(true)}
            >
              <DotsThree size={24} />
              <Text className={styles.text}>Generar acción</Text>
            </Button>
          )}
        </div>
        {loading ? (
          <div className={styles.loader}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Flex className={styles.boxContainer} vertical gap={16}>
              <Row>
                <div className={styles.headingText}>{billingData?.billing?.carrier ?? "N/A"}</div>
              </Row>
              <Row>
                <Col span={12}>
                  <div className={styles.headingText}>Total servicio</div>
                </Col>
                <Col
                  span={12}
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    borderLeft: "1px solid #DDD"
                  }}
                >
                  <div className={styles.titleText}>
                    ${formatNumber(billingData?.billing?.fare ?? 0)}
                  </div>
                </Col>
              </Row>
            </Flex>
            {/* <Flex vertical gap={32}>
              <div className={styles.headingText}>Centros de costos</div>
              <Responsibles psls={mockedPSL} insideCollapse={false} />
            </Flex> */}
            <Flex vertical gap={32}>
              <div className={styles.headingText}>Detalle del servicio</div>
              <div className={styles.container}>{tripDetailsWithNovelties}</div>
            </Flex>
          </>
        )}
      </div>
      <ModalBillingAction
        isOpen={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        idTR={billingData?.billing?.idTransferRequest ?? 0}
        totalValue={billingData?.billing?.fare ?? 0}
        billingStatus={billingData?.billing?.statusDesc}
        messageApi={messageApi}
        idBilling={billingData?.billing?.id ?? 0}
        tripId={tripId ?? 0}
      />
      <Drawer
        placement="right"
        open={openDrawer}
        onClose={handleCloseDrawer}
        closable={false}
        key="right"
        width={592}
        styles={{
          body: {
            backgroundColor: "#FFFFFF"
          }
        }}
      >
        <DrawerBody
          onClose={handleCloseDrawer}
          novelty={novelty}
          handleEdit={() => {}}
          approbeOrReject={() => {}}
          canEdit={false}
        />
      </Drawer>
      <ModalBillingMT
        mode="view"
        isOpen={isModalMTVisible}
        onClose={() => setIsModalMTVisible(false)}
        idTR={billingData?.billing?.idTransferRequest.toString() ?? "0"}
        idTrip={tripId ?? 0}
        messageApi={messageApi}
      />
    </>
  );
}
