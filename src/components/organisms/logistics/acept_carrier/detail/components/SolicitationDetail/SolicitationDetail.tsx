"use client";
import { Col, Flex } from "antd";
import AditionalInfo from "../AditionalInfo/AditionalInfo";
import Materials from "../Materials/Materials";
import styles from "./solicitationDetail.module.scss";
import { ICarrierRequestContacts } from "@/types/logistics/schema";
import { Dispatch, SetStateAction } from "react";
import { RouteMap } from "@/components/organisms/logistics/orders/DetailsOrderView/components/RouteMap/RouteMap";
import { SummaryData } from "@/components/organisms/logistics/orders/DetailsOrderView/components/SummaryData/SummaryData";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import { DataCarga, IAceptCarrierAPI } from "@/types/logistics/carrier/carrier";
import Buttons from "../Buttons/Buttons";
import { useRouter } from "next/navigation";

dayjs.locale("es");
dayjs.extend(utc);

interface SolicitationDetailProps {
  providerDetail: IAceptCarrierAPI | undefined;
  dataCarga: DataCarga[];
  persons?: ICarrierRequestContacts[];
  service_type: string | undefined;
  geometry: any;
  distance: any;
  timetravel: any;
  mapContainerRef: any;
  setView: Dispatch<SetStateAction<"detail" | "asignation" | "confirmation">>;
  showRejectButton: boolean;
}

export default function SolicitationDetail({
  providerDetail,
  dataCarga,
  service_type,
  persons,
  geometry,
  distance,
  timetravel,
  mapContainerRef,
  setView,
  showRejectButton
}: Readonly<SolicitationDetailProps>) {
  const router = useRouter();

  return (
    <Flex className={styles.wrapper}>
      <Flex className={styles.sectionWrapper} vertical>
        <Flex>
          <p className={styles.sectionTitle} style={{ marginLeft: "1.5rem" }}>
            Datos del viaje
          </p>
        </Flex>
        <Flex>
          <Col span={12} style={{ paddingRight: "0.625rem" }}>
            <SummaryData
              routeGeometry={geometry}
              distance={distance}
              timetravel={timetravel}
              weight={providerDetail?.carrier_request_material_by_trip?.reduce(
                (acc, curr) => acc + curr.material[0].kg_weight,
                0
              )}
              volume={providerDetail?.carrier_request_material_by_trip?.reduce(
                (acc, curr) => acc + curr.material[0].m3_volume,
                0
              )}
              needLiftingOrigin={false}
              needLiftingDestination={false}
              travelTypeDesc={providerDetail?.service_type ?? ""}
              user_creator={{
                user_email: providerDetail?.created_by || "",
                user_name: "",
                show: false
              }}
              start_location={providerDetail?.start_location ?? ""}
              end_location={providerDetail?.end_location ?? ""}
              start_date_flexible={"Exacto"}
              end_date_flexible={"Exacto"}
              start_date={dayjs.utc(providerDetail?.start_date).format("YYYY-MM-DD")}
              start_date_hour={dayjs.utc(providerDetail?.start_date).format("HH:mm") ?? ""}
              end_date={dayjs.utc(providerDetail?.end_date).format("YYYY-MM-DD")}
              end_date_hour={dayjs.utc(providerDetail?.end_date).format("HH:mm") ?? ""}
            />
          </Col>
          <Col span={12}>
            <RouteMap mapContainerRef={mapContainerRef} />
          </Col>
        </Flex>
      </Flex>
      <AditionalInfo
        title="Información adicional"
        documents={providerDetail?.carrier_request_documents ?? []}
        contacts={providerDetail?.carrier_request_contacts ?? []}
        specialInstructions={providerDetail?.special_instructions}
      />
      {service_type !== "Personas" && (
        <Flex vertical className={styles.materialsWrapper} style={{ width: "100%" }}>
          <h3>Materiales</h3>
          <p>&nbsp;</p>
          <Materials materials={dataCarga} />
        </Flex>
      )}
      <Buttons
        canContinue={true}
        isRightButtonActive={true}
        isLeftButtonActive={true}
        handleNext={() => setView("asignation")}
        handleBack={() => router.push("/logistics/acept_carrier")}
        handleReject={() => {}}
        isLastStep={false}
        showRejectButton={showRejectButton}
      />
    </Flex>
  );
}
