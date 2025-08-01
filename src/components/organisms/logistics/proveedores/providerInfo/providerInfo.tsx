import { Flex, Typography, message, Row, Button, Result, Spin, Skeleton } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import "../../../../../styles/_variables_logistics.css";
import "./providerInfo.scss";
import { updateDriver } from "@/services/logistics/drivers";
import { ICarrier, IFormDriver } from "@/types/logistics/schema";
import {
  getCarrierById,
  getTripTypes,
  updateCarrier,
  updateProviderStatus
} from "@/services/logistics/carrier";
import { CarrierFormTab } from "@/components/molecules/tabs/logisticsForms/CarrierForm/carrierFormTab";
import useSWR from "swr";
import { StatusForm } from "@/components/molecules/tabs/logisticsForms/driverForm/driverFormTab.mapper";
import { useRouter } from "next/navigation";

interface Props {
  isEdit?: boolean;
  idParam?: string;
  statusFormProp?: StatusForm;
}

const { Text } = Typography;

export const ProviderInfoView = ({ isEdit = false, idParam, statusFormProp = "review" }: Props) => {
  console.log("idParam", idParam);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [statusForm, setStatusForm] = useState<StatusForm>(statusFormProp);
  const { push } = useRouter();

  const fetcher = async ({ id }: { id: string }) => {
    return getCarrierById(id);
  };
  const handleFormState = useCallback((newFormState: StatusForm) => {
    setStatusForm(newFormState);
  }, []);

  const { data, isLoading, isValidating, mutate } = useSWR(
    statusForm !== "create" && idParam ? { id: idParam, key: "1" } : null,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true
    }
  );

  const onUpdateCarrier = async (finalData: any) => {
    try {
      const response = await updateCarrier(finalData);
      if (response && response.status === 200) {
        setIsLoadingSubmit(false);
        message.success("Proveedor editado", 2, () => setStatusForm("review"));
        mutate();
      }
    } catch (error) {
      setIsLoadingSubmit(false);
      message.error(error instanceof Error ? error.message : "Error al editar proveedor", 2);
    }
  };

  const { data: tripTypes, isLoading: isloadingTripTypes } = useSWR("getTripTypesProvider", getTripTypes, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });
  const handlechangeStatus = async (status: 0 | 1 | 2) => {
    const statusText = {
      0: "Proveedor desactivado",
      1: "Proveedor activado",
      2: "Proveedor auditado"
    };
    try {
      idParam && (await updateProviderStatus(idParam, status));
      message.success(`${statusText[status]} `, 2).then(() => {
        mutate();
        setStatusForm("review");
      });
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error al editar estado del proveedor",
        3
      );
    }
  };
  return (
    <Skeleton active loading={isLoading || isValidating || isloadingTripTypes}>
      <CarrierFormTab
        tripTypes={tripTypes ?? []}
        onSubmitForm={onUpdateCarrier}
        statusForm={statusForm}
        handleFormState={handleFormState}
        data={data}
        onActiveProvider={() => handlechangeStatus(1)}
        onDesactivateProvider={() => handlechangeStatus(0)}
        onAuditProvider={() => handlechangeStatus(2)}
        isLoadingSubmit={isLoadingSubmit}
      />
    </Skeleton>
  );
};
