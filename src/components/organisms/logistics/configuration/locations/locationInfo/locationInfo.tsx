"use client";
import { message, Skeleton } from "antd";
import React, { useCallback, useState } from "react";
import "../../../../../../styles/_variables_logistics.css";
import "./locationInfo.scss";
import {
  getAllDocumentsType,
  getAllGroupByLocation,
  getAllLocationTypes,
  getAllStatesByCountry,
  getLocationById,
  updateLocation,
  updateLocationStatus
} from "@/services/logistics/locations";
import { IFormLocation, ILocation } from "@/types/logistics/schema";
import { StatusForm } from "@/components/molecules/tabs/logisticsForms/locationForm/locationFormTab.mapper";
import { DocumentCompleteType } from "@/types/logistics/certificate/certificate";
import useSWR, { mutate } from "swr";
import { LocationFormTab } from "@/components/molecules/tabs/logisticsForms/locationForm/locationFormTab";
import { useRouter } from "next/navigation";

interface Props {
  params: {
    id: string;
    locationId: string;
  };
}

export const LocationInfoView = ({ params }: Props) => {
  const [statusForm, setStatusForm] = useState<StatusForm>("review");
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const { push } = useRouter();
  //console.log(params)
  const handleFormState = useCallback((newFormState: StatusForm) => {
    setStatusForm(newFormState);
  }, []);

  const fetcher = async () => {
    return getLocationById(params.id);
  };

  const { data, isLoading } = useSWR({ id: params, key: "1" }, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const handleSubmitForm = async (dataform: IFormLocation) => {
    const sendata: IFormLocation = {
      general: dataform as unknown as ILocation,
      images: [],
      IS_ACTIVE: true
    };
    sendata.general.id = Number(params.id);
    setIsLoadingSubmit(true);
    try {
      const response = await updateLocation(
        sendata.general,
        dataform?.files as DocumentCompleteType[]
      );
      if (response.status === 200) {
        setIsLoadingSubmit(false);
        message.success(`Ubicación editada`, 2, () => {
          push(`/logistics/configuration/locations/${params.id}`);
          setStatusForm("review");
        });
      }
    } catch (error) {
      setIsLoadingSubmit(false);
      message.error(error instanceof Error ? error.message : "Error al editar ubicación", 3);
    }
  };

  const handleChangeStatus = async (newStatus: boolean) => {
    try {
      const response = await updateLocationStatus(params.id, newStatus ? "1" : "0");
      if (response.status === 200) {
        message.success(`Ubicación ${newStatus ? "activada" : "inactivada"}`, 2, () => {
          push(`/logistics/configuration/locations/${params.id}`);
          setStatusForm("review");
        });
      }
    } catch (error) {
      message.error(`Hubo un error, por favor intenta mas tarde.`, 3, () =>
        setStatusForm("review")
      );
    }
  };

  const { data: documentsType, isLoading: isLoadingDocuments } = useSWR("2", getAllDocumentsType, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });
  const { data: locationTypesData, isLoading: isLoadingLocationTypes } = useSWR(
    "location-type",
    getAllLocationTypes,
    { revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  const { data: groupLocationData, isLoading: isLoadingGroupLocation } = useSWR(
    "grouplocation",
    getAllGroupByLocation,
    { revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  const { data: statesData, isLoading: isLoadingStates } = useSWR("1", getAllStatesByCountry, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  return (
    <Skeleton
      active
      loading={
        isLoading ||
        isLoadingDocuments ||
        isLoadingLocationTypes ||
        isLoadingGroupLocation ||
        isLoadingStates
      }
    >
      <LocationFormTab
        onSubmitForm={handleSubmitForm}
        data={data?.[0]}
        params={params}
        statusForm={statusForm}
        handleFormState={handleFormState}
        onActiveLocation={() => handleChangeStatus(true)}
        onDesactivateLocation={() => handleChangeStatus(false)}
        documentsType={documentsType ?? []}
        locationTypesData={locationTypesData ?? []}
        statesData={statesData ?? []}
        groupLocationData={groupLocationData ?? []}
        isLoadingSubmit={isLoadingSubmit}
        //isLoadingSelects={isLoadingSelects}
      />
    </Skeleton>
  );
};
