"use client";
import { Col, Divider, Flex, message, Skeleton } from "antd";
import { useRouter } from "next/navigation";
import SolicitationDetail from "../../detail/components/SolicitationDetail/SolicitationDetail";
import VehicleAndDriverAsignation from "../../detail/components/VehicleAndDriverAsignation/VehicleAndDriverAsignation";
import { formatMoney } from "@/utils/utils";
import { useEffect, useState } from "react";
import styles from "./AceptCarrierDetailView.module.scss";
import {
  getAceptCarrierRequestById,
  getDriverByCarrierId,
  getVehiclesByCarrierId,
  postCarrierReject,
  postCarrierRequest,
  putEditCarrierRequest
} from "@/services/logistics/acept_carrier";

import { Confirmation } from "../../detail/components/Confirmation/Confirmation";
import { useMapbox } from "@/utils/logistics/useMapBox";
import { CustomStepper } from "../../detail/components/Stepper/Stepper";
import { getTravelFreightDuration } from "@/utils/logistics/maps";
import { DataCarga, IAceptCarrierAPI, Material } from "@/types/logistics/carrier/carrier";
import { BackButton } from "../../../orders/DetailsOrderView/components/BackButton/BackButton";

interface AceptCarrierDetailProps {
  params: { id: string };
}
export enum FormMode {
  CREATE = "CREATE",
  VIEW = "VIEW",
  EDIT = "EDIT"
}

export default function AceptCarrierDetailView({ params }: Readonly<AceptCarrierDetailProps>) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [view, setView] = useState<"detail" | "asignation" | "confirmation">("detail");
  const [formMode, setFormMode] = useState<FormMode>(FormMode.VIEW);
  const [vehicleSelected, setVehicleSelected] = useState<number | null>(null);
  const [driversSelected, setDriversSelected] = useState<Array<number | null>>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [canBeRejected, setCanBeRejected] = useState<boolean>(false);

  const [observation, setObservation] = useState<any>(null);
  const router = useRouter();

  const [carrier, setCarrier] = useState<IAceptCarrierAPI>();

  const [messageApi, contextHolder] = message.useMessage();

  const mapsAccessToken =
    "pk.eyJ1IjoiamNib2JhZGkiLCJhIjoiY2x4aWgxejVsMW1ibjJtcHRha2xsNjcxbCJ9.CU7FHmPR635zv6_tl6kafA"; //import.meta.env.VITE_MAP_BOX_ACCESS_TOKEN,

  const { routeGeometry, distance, timetravel, mapContainerRef } = useMapbox({
    start_longitude: carrier?.start_longitude ?? 0,
    start_latitude: carrier?.start_latitude ?? 0,
    end_longitude: carrier?.end_longitude ?? 0,
    end_latitude: carrier?.end_latitude ?? 0,
    geometry: carrier?.geometry,
    centerMap: carrier?.id_service_type == 2,
    mapsAccessToken
  });

  const [dataCarga, setDataCarga] = useState<DataCarga[]>([]);

  useEffect(() => {
    return () => {
      setView("detail");
    };
  }, []);

  useEffect(() => {
    loadTransferRequests();
  }, []);

  const setCurrentData = (data: IAceptCarrierAPI) => {
    const { drivers, vehicle, observation } = data;
    setVehicleSelected(vehicle?.id ?? null);
    setDriversSelected(drivers.map((d) => d.id ?? null));
    observation && setObservation(observation);
  };

  const getFormMode = (statusdesc: string): FormMode => {
    if (statusdesc === "Por confirmar") {
      return FormMode.CREATE;
    } else if (statusdesc === "Aceptado" || statusdesc === "Asignadas") {
      return FormMode.EDIT;
    } else {
      return FormMode.VIEW;
    }
  };

  const loadTransferRequests = async () => {
    if (carrier != undefined) return;
    setIsLoading(true);
    try {
      const result = await getAceptCarrierRequestById(params.id);
      if (result) {
        const to: IAceptCarrierAPI = result;
        setCurrentData(to);
        setFormMode(getFormMode(to?.statusdesc));
        setCanBeRejected(to?.statusdesc !== "Rechazado");
        const driversResult = await getDriverByCarrierId(to?.id_carrier);
        setDrivers(driversResult.data.data);
        const vehiclesResult = await getVehiclesByCarrierId(to?.id_carrier);
        setVehicles(vehiclesResult.data.data);
        setCarrier(to);
        to.carrier_request_material_by_trip?.forEach(async (mat) => {
          mat?.material?.forEach(async (m) => {
            const newvalue: Material = m;
            setDataCarga((dataCarga) => [...dataCarga, { ...newvalue, quantity: mat.units }]);
          });
        });
      }
    } catch (error) {
      console.error("Error loading transfer requests", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptCR = async (
    carrierId: string,
    requestId: string,
    vehicleId: string,
    driverIds: string[],
    status: string,
    observation: string
  ) => {
    try {
      setIsLoading(true);
      await postCarrierRequest(carrierId, requestId, vehicleId, driverIds, status, observation);
      messageApi.open({
        content: "Aceptado"
      });
      router.push("/logistics/acept_carrier");
    } catch (error) {
      messageApi.open({
        content: "Hubo un problema aceptando la orden"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleEditCR = async (
    carrierId: string,
    requestId: string,
    vehicleId: string,
    driverIds: string[]
  ) => {
    try {
      setIsLoading(true);
      const res = await putEditCarrierRequest(carrierId, requestId, vehicleId, driverIds);
      message.open({
        type: "success",
        content: res.message
      });
      router.push("/logistics/acept_carrier");
    } catch (error) {
      if (error instanceof Error) messageApi.error(error.message);
      else messageApi.error("Hubo un problema editando la orden");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (formMode === FormMode.CREATE) {
      await handleAcceptCR(
        String(carrier?.id_carrier),
        params.id,
        String(vehicleSelected),
        driversSelected.map(String),
        "1",
        observation
      );
    } else
      await handleEditCR(
        String(carrier?.id_carrier),
        params.id,
        String(vehicleSelected),
        driversSelected.map(String)
      );
  };

  const handleReject = async () => {
    try {
      setIsLoading(true);
      const res = await postCarrierReject(String(carrier?.id_carrier), String(carrier?.id));
      if (res) {
        messageApi.open({
          content: "Rechazado"
        });
      }
      router.push("/logistics/acept_carrier");
    } catch (error) {
      messageApi.open({
        content: "Hubo un problema rechazando la orden"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stepIndexMap: Record<string, number> = {
    detail: 0,
    asignation: 1,
    default: 2
  };
  const currentStepIndex = stepIndexMap[view] ?? stepIndexMap.default;

  const steps = [
    { title: "Detalle solicitud", disabled: false },
    { title: "Asignación de vehículo y conductor", disabled: false },
    { title: "Confirmar servicio", disabled: false }
  ];
  const hasFormValuesChanged = () => {
    const hasVehiclesChanged = carrier?.vehicle != vehicleSelected;
    const hasDriversChanged =
      carrier?.drivers
        .map((d) => d.id)
        .toSorted()
        .toString() !== driversSelected.toSorted().toString();

    return hasVehiclesChanged || hasDriversChanged;
  };

  const renderView = () => {
    switch (view) {
      case "detail":
        return (
          <SolicitationDetail
            providerDetail={carrier}
            dataCarga={dataCarga}
            service_type={carrier?.service_type}
            geometry={routeGeometry}
            distance={distance}
            timetravel={
              carrier?.id_service_type !== 2
                ? timetravel
                : getTravelFreightDuration(carrier?.start_date, carrier?.end_date)
            }
            mapContainerRef={mapContainerRef}
            setView={setView}
            showRejectButton={canBeRejected}
          />
        );
      case "asignation":
        return (
          <VehicleAndDriverAsignation
            drivers={drivers}
            vehicles={vehicles}
            setDrivers={setDriversSelected}
            setVehicle={setVehicleSelected}
            carrier={carrier}
            currentDrivers={driversSelected}
            currentVehicle={vehicleSelected}
            formMode={formMode}
            setView={setView}
            handleReject={handleReject}
            showRejectButton={canBeRejected}
          />
        );
      case "confirmation":
      default:
        return (
          <Confirmation
            driverSelected={drivers?.filter((driver) => driversSelected.includes(driver.id))}
            vehicleSelected={vehicles.find((a) => a.id === vehicleSelected)}
            setObservation={setObservation}
            hasFormValuesChanged={hasFormValuesChanged}
            formMode={formMode}
            currentObservation={observation}
            setView={setView}
            handleSubmit={handleSubmit}
            handleReject={handleReject}
            showRejectButton={canBeRejected}
          />
        );
    }
  };

  return (
    <>
      {contextHolder}
      <Flex className={styles.wrapper}>
        <BackButton href="/logistics/acept_carrier" title={`Detalle de CR ${params.id}`} />
        <CustomStepper steps={steps} currentStepIndex={currentStepIndex} />
        <Skeleton active loading={isLoading}>
          <Flex className={styles.sectionWraper} style={{ marginBottom: "2rem" }}>
            <Col span={11}>
              <div className={styles.vehicle}>
                <p className={styles.subtitle}>{carrier?.vehicles}</p>
              </div>
              <div>
                <p className={styles.text}>
                  Origen: <b>{carrier?.start_location}</b> - Destino: <b>{carrier?.end_location}</b>
                </p>
              </div>
            </Col>
            <Col span={2}>
              <Divider type="vertical" className={styles.divider} />
            </Col>
            <Col
              span={11}
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                flexDirection: "column"
              }}
            >
              <p className={styles.heading}>{formatMoney(carrier?.amount)}</p>
              {carrier?.fee_description && (
                <p className={styles.text}>{carrier?.fee_description}</p>
              )}
            </Col>
          </Flex>
          {renderView()}
        </Skeleton>
      </Flex>
    </>
  );
}
