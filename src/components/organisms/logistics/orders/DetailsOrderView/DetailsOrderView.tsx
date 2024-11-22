import { Flex, message, Row, Col, Spin } from "antd";
import React, { useEffect, useState } from "react";

// dayjs locale
import dayjs from "dayjs";
import "dayjs/locale/es-us";
import utc from "dayjs/plugin/utc";
dayjs.locale("es");
dayjs.extend(utc);

// mapbox
import "mapbox-gl/dist/mapbox-gl.css";

//schemas
import { IMaterial, ITransferOrder, ITripSummaryAPI, TripType } from "@/types/logistics/schema";

//navigation
import { useRouter } from "next/navigation";

//api
import { getTransferOrderById } from "@/services/logistics/transfer-orders";
import { RouteMap } from "./components/RouteMap/RouteMap";
import { SummaryData } from "./components/SummaryData/SummaryData";
import { Responsibles } from "./components/Responsibles/Responsibles";
import AditionalInfo from "../../acept_carrier/detail/components/AditionalInfo/AditionalInfo";
import Materials from "../../acept_carrier/detail/components/Materials/Materials";

//styles
import styles from "./DetailsOrderView.module.scss";
import { useMapbox } from "@/utils/logistics/useMapBox";
import Persons from "../../acept_carrier/detail/components/Persons/Persons";
import { DataCarga } from "@/types/logistics/carrier/carrier";
import Link from "next/link";
import { CaretLeft } from "phosphor-react";
import { BackButton } from "./components/BackButton/BackButton";
import { TabEnum } from "../../transfer-orders/TransferOrders";

interface Props {
  idOrder: string;
}

export const DetailsOrderView = ({ idOrder = "" }: Props) => {
  const { push } = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [transferOrder, setTransferOrder] = useState<ITripSummaryAPI>();
  const [tripType, setTripType] = useState<TripType>(TripType.Carga);
  const [materialsTotalWeight, setMaterialsTotalWeight] = useState<number>(0);
  const [materialsTotalVolume, setMaterialsTotalVolume] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);

  const optionsFlexible = [
    { value: 0, label: "Exacto" },
    { value: 1, label: "+/- 1 día" },
    { value: 2, label: "+/- 2 días" },
    { value: 3, label: "+/- 3 días" }
  ];

  const [dataCarga, setDataCarga] = useState<DataCarga[]>([]);

  /* MAPBOX */
  const mapsAccessToken =
    "pk.eyJ1IjoiamNib2JhZGkiLCJhIjoiY2x4aWgxejVsMW1ibjJtcHRha2xsNjcxbCJ9.CU7FHmPR635zv6_tl6kafA"; //import.meta.env.VITE_MAP_BOX_ACCESS_TOKEN,

  const { routeGeometry, distance, timetravel, mapContainerRef } = useMapbox({
    start_longitude: transferOrder?.start_location?.longitude ?? 0,
    start_latitude: transferOrder?.start_location?.latitude ?? 0,
    end_longitude: transferOrder?.end_location?.longitude ?? 0,
    end_latitude: transferOrder?.end_location?.latitude ?? 0,
    geometry: transferOrder?.geometry,
    centerMap: transferOrder?.id_service_type == "2",
    mapsAccessToken
  });

  useEffect(() => {
    loadTransferOrder();
  }, []);

  function calculateTotalVolumeAndWeight(to: ITransferOrder) {
    let totalVolume = 0;
    let totalWeight = 0;

    if (to.transfer_order_material) {
      for (const materialItem of to.transfer_order_material) {
        if (materialItem.material) {
          for (const material of materialItem.material) {
            totalVolume += material.m3_volume * materialItem.quantity;
            totalWeight += material.kg_weight * materialItem.quantity;
          }
        }
      }
    }

    return { totalVolume, totalWeight };
  }
  const loadTransferOrder = async () => {
    if (transferOrder != undefined) return;
    try {
      setLoading(true);
      const result = await getTransferOrderById(idOrder);
      if (result?.data?.data?.length > 0) {
        const to: ITransferOrder = result.data.data[0];
        setTransferOrder(to);
        setTripType(to.service_type_desc);
        to.transfer_order_material?.forEach(async (mat) => {
          mat?.material?.forEach(async (m) => {
            const newvalue: any = m;
            newvalue.quantity = mat.quantity;
            setDataCarga((prevData) => [...prevData, newvalue]);
          });
        });
        if (to) {
          const { totalVolume, totalWeight } = calculateTotalVolumeAndWeight(to);
          setMaterialsTotalVolume(totalVolume);
          setMaterialsTotalWeight(totalWeight);
        }
      }
    } catch (error) {
      console.log("Error getTransferOrderById: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      {loading ? (
        <Spin size="large" />
      ) : (
        <Flex className={styles.wrapper} gap={"1.5rem"}>
          <Flex>
            <Col span={12} style={{ paddingRight: "0.625rem" }}>
              <Flex
                vertical
                className={styles.sectionContainer}
                style={{ width: "100%", height: "100%" }}
              >
                <Flex style={{ marginLeft: "1rem", marginTop: "1rem" }}>
                  <BackButton
                    title={`Detalle de TO ${transferOrder?.id ?? idOrder}`}
                    href={`/logistics/transfer-orders?tab=${TabEnum.REQUESTS}`}
                  />
                </Flex>
                <RouteMap title="Ruta" mapContainerRef={mapContainerRef} />
              </Flex>
            </Col>
            <Col span={12}>
              <Flex className={styles.sectionContainer}>
                <SummaryData
                  title="Resumen"
                  routeGeometry={routeGeometry}
                  distance={distance}
                  timetravel={timetravel}
                  needLiftingOrigin={transferOrder?.start_freight_equipment}
                  needLiftingDestination={transferOrder?.end_freight_equipment}
                  travelTypeDesc={transferOrder?.service_type_desc ?? ""}
                  user_creator={{
                    user_email: transferOrder?.created_by || "",
                    user_name: transferOrder?.created_by_user || "",
                    show: true
                  }}
                  vehiclesSuggested={transferOrder?.transfer_order_vehicles}
                  start_location={transferOrder?.start_location?.description ?? ""}
                  end_location={transferOrder?.end_location?.description ?? ""}
                  start_date_flexible={
                    optionsFlexible.find((x) => x.value == transferOrder?.start_date_flexible)
                      ?.label ?? ""
                  }
                  end_date_flexible={
                    optionsFlexible.find((x) => x.value == transferOrder?.end_date_flexible)
                      ?.label ?? ""
                  }
                  start_date={dayjs.utc(transferOrder?.start_date).format("YYYY-MM-DD")}
                  start_date_hour={dayjs.utc(transferOrder?.start_date).format("HH:mm") ?? ""}
                  end_date={dayjs.utc(transferOrder?.end_date).format("YYYY-MM-DD")}
                  end_date_hour={dayjs.utc(transferOrder?.end_date).format("HH:mm") ?? ""}
                  freight_origin_time={transferOrder?.freight_origin_time}
                  freight_destination_time={transferOrder?.freight_destination_time}
                  volume={materialsTotalVolume}
                  weight={materialsTotalWeight}
                />
              </Flex>
            </Col>
          </Flex>
          <Flex vertical>
            <Responsibles title="Responsables" psls={transferOrder?.transfer_order_psl ?? []} />
          </Flex>
          <Flex vertical>
            <AditionalInfo
              title="Información adicional"
              documents={transferOrder?.transfer_order_documents ?? []}
              contacts={transferOrder?.transfer_order_contacts ?? []}
              otherRequirements={transferOrder?.transfer_order_other_requeriments ?? []}
              specialInstructions={transferOrder?.observation ?? ""}
              finalClient={transferOrder?.client_desc ?? ""}
              contractNumber={transferOrder?.contract_number}
              declaredCargoValue={transferOrder?.declared_cargo_value}
            />
          </Flex>
          <Flex className={styles.container} vertical>
            {tripType === TripType.Personas ? (
              <>
                <p className={styles.sectionTitle}>Personas</p>
                <Persons persons={transferOrder?.transfer_order_persons ?? []} />
                <p>&nbsp;</p>
              </>
            ) : (
              <>
                <p className={styles.sectionTitle}>Carga</p>
                <Materials materials={dataCarga} />
                <p>&nbsp;</p>
              </>
            )}
            <p className={styles.title}>Vehículos sugeridos</p>
            <Row>
              <Col span={24} style={{ paddingTop: "0.5rem" }}>
                {transferOrder?.transfer_order_vehicles?.map((veh) => (
                  <div className={styles.selected} key={veh.id}>
                    {veh.vehicle_type_desc} <small>{veh.quantity}</small>
                  </div>
                ))}
              </Col>
            </Row>
          </Flex>
          <Flex>
            <Col span={12}>
              <button
                className={styles.backButton}
                onClick={() => {
                  push("/logistics/transfer-orders");
                }}
              >
                Regresar
              </button>
            </Col>
            <Col span={12} />
          </Flex>
        </Flex>
      )}
    </>
  );
};
