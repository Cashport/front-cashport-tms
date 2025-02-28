"use client";
import { message, Skeleton } from "antd";
import "../../../../../styles/_variables_logistics.css";
import "./vehicleInfo.scss";
import { VehicleFormTab } from "@/components/molecules/tabs/logisticsForms/vehicleForm/vehicleFormTab";
import {
  getFeaturesVehicle,
  getVehicleById,
  getVehicleType,
  updateVehicle,
  updateVehicleStatus
} from "@/services/logistics/vehicle";
import useSWR, { mutate } from "swr";
import { useCallback, useState } from "react";
import { StatusForm } from "@/components/molecules/tabs/logisticsForms/vehicleForm/vehicleFormTab.mapper";
import { getDocumentsByEntityType } from "@/services/logistics/certificates";
import { useRouter } from "next/navigation";

interface Props {
  idParam: string;
  params: {
    id: string;
    vehicleId: string;
  };
}

export const VehicleInfoView = ({ idParam = "", params }: Props) => {
  const [statusForm, setStatusForm] = useState<StatusForm>("review");
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [revalidate, setRevalidate] = useState("1");
  const { push } = useRouter();

  const fetcher = async ({ id }: { id: string }) => {
    return getVehicleById(id);
  };

  const handleFormState = useCallback((newFormState: StatusForm) => {
    setStatusForm(newFormState);
  }, []);

  const { data, isLoading, isValidating } = useSWR({ id: idParam, key: revalidate }, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: true
  });

  const handleSubmit = async (data: any) => {
    setIsLoadingSubmit(true);
    try {
      const response = await updateVehicle({ ...data }, data.files, data.images);
      if (response && response.status === 200) {
        setIsLoadingSubmit(false);
        message.success("Vehículo editado", 2, () => setStatusForm("review"));
        setRevalidate(String(Math.random()));
      }
    } catch (error) {
      setIsLoadingSubmit(false);
      message.error(error instanceof Error ? error.message : "Error al editar vehículo", 2);
    }
  };
  const handlechangeStatus = async (status: 0 | 1 | 2) => {
    const statusText = {
      0: "Vehículo desactivado",
      1: "Vehículo activado",
      2: "Vehículo auditado"
    };
    try {
      await updateVehicleStatus(params.vehicleId, status);
      message.success(`${statusText[status]} `, 2).then(() => {
        push(`/logistics/providers/${params.id}/vehicle`);
        setStatusForm("review");
      });
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error al editar estado del vehículo",
        3
      );
    }
  };
  const { data: documentsType, isLoading: isLoadingDocuments } = useSWR(
    "1",
    getDocumentsByEntityType,
    { revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  const { data: vehiclesTypesData, isLoading: isLoadingVehicles } = useSWR(
    "/vehicle/type",
    getVehicleType,
    { revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  const { data: features, isLoading: isLoadingFeatures } = useSWR(
    "/features/vehicles",
    getFeaturesVehicle,
    { revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  return (
    <Skeleton active loading={isLoading || isValidating || isLoadingDocuments || isLoadingVehicles || isLoadingFeatures}>
      <VehicleFormTab
        statusForm={statusForm}
        handleFormState={handleFormState}
        data={data}
        params={params}
        onSubmitForm={handleSubmit}
        documentsTypesList={documentsType ?? []}
        vehiclesTypesList={vehiclesTypesData ?? []}
        isLoading={isLoadingSubmit}
        onActiveVehicle={() => handlechangeStatus(1)}
        onDesactivateVehicle={() => handlechangeStatus(0)}
        onAuditVehicle={() => handlechangeStatus(2)}
        features={features || []}
      />
    </Skeleton>
  );
};
