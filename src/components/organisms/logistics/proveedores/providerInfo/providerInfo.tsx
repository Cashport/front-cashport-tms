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
  idParam: string;
}

const { Text } = Typography;

export const ProviderInfoView = ({ isEdit = false, idParam = "" }: Props) => {
  console.log("idParam", idParam);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [statusForm, setStatusForm] = useState<StatusForm>("review");
  const { push } = useRouter();

  const fetcher = async ({ id }: { id: string }) => {
    return getCarrierById(id);
  };
  const handleFormState = useCallback((newFormState: StatusForm) => {
    setStatusForm(newFormState);
  }, []);

  const { data, isLoading, isValidating, mutate } = useSWR({ id: idParam, key: "1" }, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: true
  });

  const onUpdateCarrier = async (finalData: any) => {
    try {
      const response = await updateCarrier(finalData.general);
      if (response && response.status === 200) {
        setIsLoadingSubmit(false);
        message.success("Proveedor editado", 2, () => setStatusForm("review"));
        mutate({ id: idParam, key: "1" });
      }
    } catch (error) {
      setIsLoadingSubmit(false);
      message.error(error instanceof Error ? error.message : "Error al editar proveedor", 2);
    }
  };

  const { data: tripTypes, isLoading: isloadingTripTypes } = useSWR("1", getTripTypes, {
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
      await updateProviderStatus(idParam, status);
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
