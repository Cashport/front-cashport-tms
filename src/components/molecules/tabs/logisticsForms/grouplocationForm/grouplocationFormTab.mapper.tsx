import { ICertificates, ILocation, IState } from "@/types/logistics/schema";
import Title from "antd/es/typography/Title";
import { SetStateAction } from "react";

export type StatusForm = "review" | "create" | "edit";

export interface LocationGroupFormTabProps {
  idLocationForm?: string;
  data?: LocationData;
  disabled?: boolean;
  onEditLocation?: () => void;
  onSubmitForm?: (data: any) => void;
  handleFormState?: (newFormState: StatusForm) => void;
  onActiveLocation?: () => void;
  onDesactivateLocation?: () => void;
  statusForm: "create" | "edit" | "review";
  params: {
    id: string;
    groupLocationId: string;
  };
  statesData: IState[];
  isLoadingSubmit: boolean;
}

export type LocationData = ILocation & { licence?: string } & { documents?: ICertificates[] };

export interface FileObject {
  file: File;
  docReference?: string;
}

export const normalizeLocationData = (data: any): any => {
  if (!data) return {};

  const documents = data?.documents?.map((doc: any) => ({
    file: {
      name: doc.template?.split("/").pop(),
      url: doc.template
    }
  }));

  return {
    general: {
      id: data.id.toString(),
      description: data.description,
      city_id: data.city_id.toString(),
      postal_code: "",
      url_location: "",
      latitude: data.latitude,
      longitude: data.longitude,
      location_type: data.location_type_id?.toString(),
      active: data.active,
      created_at: new Date(data.created_at),
      created_by: data.created_by,
      modified_at: new Date(data.modified_at),
      modified_by: data.modified_by,
      state_id: data.state_id?.toString(),
      group_location: data.group_location_id,
      additional_info: data.additional_info,
      contact_name: data.contact_name,
      contact_number: data.contact_number,
      IS_ACTIVE: data.active
    },
    files: documents,
    IS_ACTIVE: data.active
  };
};

export const _onSubmitLocation = (
  data: any,
  setloading: (value: SetStateAction<boolean>) => void,
  onSubmitForm: (data: any) => void
) => {
  setloading(true);
  try {
    onSubmitForm({ ...data });
  } catch (error) {
    console.warn({ error });
  } finally {
    setloading(false);
  }
};

export const validationButtonText = (statusForm: "create" | "edit" | "review") => {
  switch (statusForm) {
    case "create":
      return "Crear nuevo grupo";
    case "edit":
      return "Guardar Cambios";
    case "review":
      return "Editar ubicación";
  }
};

export const TitleFormTab = (title: string, level: 1 | 2 | 5 | 3 | 4 | undefined) => {
  return (
    <Title className="title" level={level}>
      {title}
    </Title>
  );
};
