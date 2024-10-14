"use client";
import { message, Skeleton } from "antd";
import { useRouter } from "next/navigation";
import "../../../../../../styles/_variables_logistics.css";
import "./createLocation.scss";
import { LocationFormTab } from "@/components/molecules/tabs/logisticsForms/locationForm/locationFormTab";
import {
  addLocation,
  getAllDocumentsType,
  getAllGroupByLocation,
  getAllLocationTypes,
  getAllStatesByCountry
} from "@/services/logistics/locations";
import { useState } from "react";
import useSWR from "swr";

type Props = {
  params: {
    id: string;
    locationId: string;
  };
};

export const CreateLocationView = ({ params }: Props) => {
  const { push } = useRouter();
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoadingSubmit(true);
    try {
      const response = await addLocation({ ...data }, data.files);
      if (response && response.status === 200) {
        setIsLoadingSubmit(false);
        message.success(`Ubicación creada`, 2, () =>
          push(`/logistics/configuration/locations/all`)
        );
      }
    } catch (error) {
      setIsLoadingSubmit(false);
      message.error(
        error instanceof Error ? error.message : "Hubo un error al crear ubicación",
        2,
        () => push(`/logistics/configuration/locations/all`)
      );
    }
  };
  const { data: documentsType, isLoading: isLoadingDocuments } = useSWR(
    "documents-types",
    getAllDocumentsType,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );
  const { data: locationTypesData, isLoading: isLoadingLocationTypes } = useSWR(
    "location-type",
    getAllLocationTypes,
    { revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  const { data: groupLocationData, isLoading: isLoadingGroupLocation } = useSWR(
    "group-location",
    getAllGroupByLocation,
    { revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  const { data: statesData, isLoading: isLoadingStates } = useSWR(
    "states-data",
    getAllStatesByCountry,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  return (
    <Skeleton
      active
      loading={
        isLoadingDocuments || isLoadingLocationTypes || isLoadingGroupLocation || isLoadingStates
      }
    >
      <LocationFormTab
        onSubmitForm={handleSubmit}
        statusForm={"create"}
        params={params}
        isLoadingSubmit={isLoadingSubmit}
        documentsType={documentsType ?? []}
        locationTypesData={locationTypesData ?? []}
        statesData={statesData ?? []}
        groupLocationData={groupLocationData ?? []}
      />
    </Skeleton>
  );
};
