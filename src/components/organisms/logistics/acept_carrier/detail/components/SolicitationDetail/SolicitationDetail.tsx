"use client";
import { Col, Flex, Input, Button, Upload } from "antd";
import { Money, Files } from "@phosphor-icons/react";
import { NumericFormat } from "react-number-format";
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
import { RequirementSummaryData } from "@/components/organisms/logistics/orders/DetailsOrderView/components/RequirementSummaryData.tsx/RequirementSummaryData";

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
  quote: {
    amount: number;
    files: File[];
  };
  setQuote: Dispatch<
    SetStateAction<{
      amount: number;
      files: File[];
    }>
  >;
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
  setQuote
}: Readonly<SolicitationDetailProps>) {
  const router = useRouter();

  const handleQuoteAmountChange = (value: number | undefined) => {
    const amount = value || 0;
    setQuote({
      amount,
      files: quote.files
    });
  };

  const handleFileChange = (file: File) => {
    setQuote({
      amount: quote.amount,
      files: [file]
    });
    return false; // Prevent automatic upload
  };

  return (
    <Flex className={styles.wrapper}>
      {providerDetail?.isAuction ? (
        <Flex gap="3.125rem" align="center" justify="space-between">
          {/* Cost input section */}
          <Flex align="center" gap="0.5rem" style={{ flex: 1 }}>
            <Flex align="center" gap="0.8rem" style={{ color: "#666666" }}>
              <Money size={20} />
              <p style={{ fontWeight: 400 }}>Costo</p>
            </Flex>
            <div style={{ flex: 1 }}>
              <NumericFormat
                value={quote.amount}
                onValueChange={(values) => {
                  handleQuoteAmountChange(values.floatValue);
                }}
                thousandSeparator="."
                decimalSeparator=","
                prefix="$ "
                placeholder="$0"
                customInput={Input}
                style={{ width: "100%" }}
                allowNegative={false}
                decimalScale={0}
              />
            </div>
          </Flex>

          {/* Document upload section */}
          <Flex align="center" gap="0.5rem" style={{ flex: 1 }}>
            <Flex align="center" gap="0.8rem" style={{ color: "#666666" }}>
              <Files size={20} />
              <p style={{ fontWeight: 400 }}>PDF Cotización</p>
            </Flex>
            <div style={{ flex: 1 }}>
              <Flex gap="0.5rem" align="center" vertical>
                {quote.files[0] && (
                  <span style={{ fontSize: "0.875rem", color: "#666" }}>{quote.files[0].name}</span>
                )}
                <Upload
                  accept=".pdf"
                  showUploadList={false}
                  beforeUpload={handleFileChange}
                  maxCount={1}
                >
                  <Button type="default">Agregar soporte</Button>
                </Upload>
              </Flex>
            </div>
          </Flex>
        </Flex>
      ) : null}

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
        isRightButtonActive={true}
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
