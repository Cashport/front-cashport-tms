"use client";
import { Col, Flex } from "antd";
import AditionalInfo from "../AditionalInfo/AditionalInfo";
import Materials from "../Materials/Materials";
import AuctionForm from "../AuctionForm/AuctionForm";
import TercerizationForm from "../TercerizationForm/TercerizationForm";
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
import { RequirementSummaryData } from "@/components/organisms/logistics/orders/DetailsOrderView/components/RequirementSummaryData.tsx/RequirementSummaryData";
import { FormMode, IQuote } from "../../../view/AceptCarrierDetailView/AceptCarrierDetailView";

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
  handleReject: () => Promise<void>;
  entityType?: "otherRequirement" | "trip";
  quote?: IQuote;
  setQuote: Dispatch<SetStateAction<IQuote | undefined>>;
  formMode: FormMode;
}

export default function SolicitationDetail({
  providerDetail,
  dataCarga,
  service_type,
  geometry,
  distance,
  timetravel,
  mapContainerRef,
  setView,
  showRejectButton,
  handleReject,
  entityType = "trip",
  quote,
  setQuote,
  formMode
}: Readonly<SolicitationDetailProps>) {
  const router = useRouter();

  const handleQuoteAmountChange = (value: number | undefined) => {
    setQuote({
      ...quote,
      auction_amount: value || 0
    });
  };

  const handleFileChange = (file: File) => {
    setQuote({
      ...quote,
      auction_file: [file]
    });
    return false;
  };

  const handleAssociationCostChange = (value: number | undefined) => {
    const association_cost = value || 0;
    setQuote({
      ...quote,
      association_cost
    });
  };

  const handleAssociationNameChange = (value: string | undefined) => {
    const association_name = value || "";
    setQuote({
      ...quote,
      association_name
    });
  };

  const handleAssociationFileChange = (file: File) => {
    setQuote({
      ...quote,
      association_file: [file]
    });
    return false; // Prevent automatic upload
  };

  return (
    <Flex className={styles.wrapper}>
      {/* If its auction */}
      {formMode === FormMode.CREATE && (
        <>
          {providerDetail?.isTercerization ? (
            // Si es tercerización, mostrar ambos formularios
            <>
              <TercerizationForm
                quote={quote}
                onQuoteAmountChange={handleAssociationCostChange}
                onQuoteAssociationNameChange={handleAssociationNameChange}
                onFileChange={handleAssociationFileChange}
                formMode={formMode}
              />
              <AuctionForm
                quote={quote}
                onQuoteAmountChange={handleQuoteAmountChange}
                onFileChange={handleFileChange}
                formMode={formMode}
              />
            </>
          ) : providerDetail?.isAuction ? (
            // Si solo es subasta, mostrar solo AuctionForm
            <AuctionForm
              quote={quote}
              onQuoteAmountChange={handleQuoteAmountChange}
              onFileChange={handleFileChange}
              formMode={formMode}
            />
          ) : null}
        </>
      )}

      <Flex className={styles.sectionWrapper} vertical>
        <Flex>
          <p className={styles.sectionTitle} style={{ marginLeft: "1.5rem" }}>
            Datos del viaje
          </p>
        </Flex>
        <Flex>
          <Col span={12} style={{ paddingRight: "0.625rem" }}>
            {entityType === "otherRequirement" && providerDetail?.other_requirement ? (
              <RequirementSummaryData
                routeGeometry={geometry}
                other_requirement={providerDetail?.other_requirement}
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
            ) : (
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
            )}
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
        declaredCargoValue={providerDetail?.declared_cargo_value}
        finalClient={providerDetail?.client_desc}
      />
      {service_type !== "Personas" && entityType !== "otherRequirement" && (
        <Flex vertical className={styles.materialsWrapper} style={{ width: "100%" }}>
          <h3>Materiales</h3>
          <p>&nbsp;</p>
          <Materials materials={dataCarga} />
        </Flex>
      )}
      <Buttons
        canContinue={true}
        isRightButtonActive={
          formMode === FormMode.CREATE
            ? providerDetail?.isTercerization
              ? !!(
                  quote?.association_cost &&
                  quote?.association_name &&
                  quote?.association_file &&
                  quote.association_file.length > 0 &&
                  quote?.auction_amount &&
                  quote?.auction_file &&
                  quote.auction_file.length > 0
                )
              : providerDetail?.isAuction
                ? !!(quote?.auction_amount && quote?.auction_file && quote.auction_file.length > 0)
                : true
            : true
        }
        isLeftButtonActive={true}
        handleNext={() => {
          if (entityType === "otherRequirement") {
            setView("confirmation");
          } else setView("asignation");
        }}
        handleBack={() => router.push("/logistics/acept_carrier")}
        handleReject={handleReject}
        isLastStep={false}
        showRejectButton={showRejectButton}
      />
    </Flex>
  );
}
