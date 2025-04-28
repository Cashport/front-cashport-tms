import React, { FC, useMemo, useState } from "react";
import useSWR from "swr";
import {
  CaretDoubleRight,
  Receipt,
  ArrowLineDown,
  ArrowsClockwise,
  CaretDown
} from "phosphor-react";
import { Dropdown, MenuProps, Skeleton, Typography, message } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/es"; // Importar el idioma español

import { updateTripTrackingStatus } from "@/services/logistics/tracking";
import { TransferOrdersState } from "@/utils/constants/transferOrdersState";
import { fetcher } from "@/utils/api/api";
import { formatMoney } from "@/utils/utils";

import UiTab from "@/components/ui/ui-tab";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { ModalVehicleFollowUp } from "./components/ModalVehicleFollowUp";
import ModalHeader from "./components/ModalHeader";
import { FileDownloadModal } from "../FileDownloadModal/FileDownloadModal";
import TimelineEvents from "@/components/ui/timeline-events";

import { STATUS } from "@/utils/constants/globalConstants";
import { ApiResponse, VehicleTracking } from "@/types/logistics/tracking/tracking";

import "./modalResumeTracking.scss";

const { Text } = Typography;
interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  idTR: number;
}
export const TrackingStepState = [
  {
    name: "Aprobado",
    bgColor: "#CBE71E",
    textColor: "#141414",
    id: STATUS.NOVELTY.ACEPTADA
  },
  {
    name: "Rechazado",
    bgColor: "#EE0D0D",
    textColor: "#FFFFFF",
    id: STATUS.NOVELTY.RECHAZADA
  },
  {
    name: "Abierto",
    bgColor: "#495057",
    textColor: "#FFFFFF",
    id: STATUS.NOVELTY.PENDIENTE
  }
];

const ModalResumeTracking: FC<InvoiceDetailModalProps> = ({ isOpen, onClose, idTR }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<string>("1");
  const [isModalChangeStatus, setisModalChangeStatus] = useState(false);
  const [newTripStatus, setNewTripStatus] = useState<string>(STATUS.TR.POR_ACEPTAR);
  const [urlStep, setUrlStep] = useState<string>("");

  const [comment, setComment] = useState<string>("");
  const [isLoadingChangeStatus, setIsLoadingChangeStatus] = useState<boolean>(false);
  const onChange = (key: string) => setActiveKey(key);

  const { data, isLoading, mutate } = useSWR<ApiResponse<VehicleTracking[]>>(
    isOpen ? `/transfer-request/triptracking/${idTR}` : null,
    fetcher,
    {}
  );

  const vehicles = data?.data;
  const generateTabsFromVehicles = (vehicles: VehicleTracking[]) => {
    return vehicles.map((vehicle, index) => ({
      key: (index + 1).toString(),
      label: vehicle.plate_number
    }));
  };
  const formatDate = (dateString: string) => {
    return dayjs(dateString)
      .locale("es") // Configurar español
      .format("DD MMMM, YYYY - HH:mm"); // Formato deseado
  };
  const items = generateTabsFromVehicles(vehicles ?? []);

  const currentVehicle = useMemo(() => {
    if (!vehicles) return null;
    return vehicles[Number(activeKey) - 1];
  }, [activeKey, vehicles]);

  const timeLineData = currentVehicle?.trip_tracking;

  const onSubmitNewStatus = async () => {
    const finalData = {
      tripId: currentVehicle?.id ?? 0,
      tripStatus: newTripStatus,
      comment: comment
    };
    setIsLoadingChangeStatus(true);
    try {
      const response = await updateTripTrackingStatus(finalData);
      if (response) {
        message.success(`Cambio de estado realizado correctamente`, 3);
        await mutate(undefined, { revalidate: true });
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Cambio de estado no realizado", 3);
    } finally {
      setIsLoadingChangeStatus(false);
      setisModalChangeStatus(false);
    }
  };

  const getStateDropdown = (stateId: string) => {
    let getState = TransferOrdersState.find((f) => f.id === stateId);
    if (!getState) {
      getState = TransferOrdersState.find((f) => f.id === "d33e062f-51a5-457e-946e-a45cbbffbf95");
    }

    return (
      <div className="trackStateContainer">
        <Text className="trackState" style={{ backgroundColor: getState?.bgColor }}>
          {getState?.name}
        </Text>
        <CaretDown size={16} />
      </div>
    );
  };
  const itemsGenerateAction: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <ButtonGenerateAction
          icon={<ArrowsClockwise size={"1.5rem"} />}
          title="Seguimiento"
          onClick={() => setisModalChangeStatus(true)}
          hideArrow
        />
      )
    }
  ];
  const menuStyle: React.CSSProperties = {
    backgroundColor: "white",
    boxShadow: "none"
  };

  const handleDocumentClick = (documentUrl: string) => {
    const fileExtension = documentUrl?.split(".").pop()?.toLowerCase() ?? "";
    if (["png", "jpg", "jpeg"].includes(fileExtension)) {
      setUrlStep(documentUrl);
      if (isModalOpen === false) setIsModalOpen(true);
    } else {
      window.open(documentUrl, "_blank");
    }
  };

  const getStepState = (statusId: string) => {
    const getState = TrackingStepState.find((f) => f.id === statusId);
    if (!getState) return undefined;
    return (
      <div className="trackStateContainer">
        <Text
          className="eventTag"
          style={{ backgroundColor: getState?.bgColor, color: getState?.textColor }}
        >
          {getState?.name}
        </Text>
      </div>
    );
  };

  const timelineItems = (timeLineData ?? []).map((item) => ({
    id: item.id,
    title: item.event_description,
    date: formatDate(item.event_time),
    leftIcon: item.url_photo ? (
      <ArrowLineDown size={14} style={{ cursor: "pointer" }} />
    ) : undefined,
    handleLeftIconClick: () => handleDocumentClick(item.url_photo ?? ""),
    tag: getStepState(item.id_status),
    content: (
      <>
        {item.created_by && <div className="name">{`Responsable: ${item.created_by}`}</div>}
        {item.base_value && (
          <p className="name">
            Valor base <span style={{ fontWeight: 600 }}>{formatMoney(item.base_value)}</span>
          </p>
        )}
        {item.novelty_type_description && (
          <div className="name">{`Tipo de sobrecosto: ${item.novelty_type_description}`}</div>
        )}
        {item.quantity && <div className="name">{`Cantidad: ${item.quantity}`}</div>}
        {item.fare && (
          <p className="name">
            Tarifa: <span style={{ fontWeight: 600 }}>{formatMoney(item.fare ?? "0")}</span>
          </p>
        )}
        {item.comment && <div className="name">{`Comentario: ${item.comment}`}</div>}
        {item.provider_comment && (
          <div className="name">{`Comentario proveedor: ${item.provider_comment}`}</div>
        )}
      </>
    )
  }));

  return (
    <aside className={`modalResumeTrackingWrapper ${isOpen ? "show" : "hide"}`}>
      <ModalVehicleFollowUp
        isOpen={isModalChangeStatus}
        onClose={() => setisModalChangeStatus(false)}
        onChangeStatus={(newStatus) => setNewTripStatus(newStatus)}
        tripStatus={newTripStatus}
        currentVehicle={currentVehicle}
        comment={comment}
        setComment={setComment}
        dropdownItems={items}
        getStateDropdown={getStateDropdown}
        onConfirm={onSubmitNewStatus}
        isLoading={isLoadingChangeStatus}
      />
      <FileDownloadModal
        isModalOpen={isModalOpen}
        onCloseModal={() => {
          setIsModalOpen(false);
        }}
        url={urlStep}
      />
      <div className="header">
        <button type="button" className="buttonBack" onClick={onClose}>
          <CaretDoubleRight />
        </button>
        <h4 className="numberInvoice">Tracking</h4>
        <div className="viewInvoice">
          <Receipt size={20} />
          Ver Soportes
        </div>
        <Dropdown
          menu={{ items: itemsGenerateAction }}
          trigger={["click"]}
          dropdownRender={(menu) => (
            <div>
              {React.cloneElement(
                menu as React.ReactElement<{
                  style: React.CSSProperties;
                }>,
                { style: menuStyle }
              )}
            </div>
          )}
        >
          <GenerateActionButton
            onClick={() => {
              console.log("click");
            }}
          />
        </Dropdown>
      </div>
      <Skeleton loading={isLoading} active>
        {currentVehicle && (
          <>
            <UiTab tabs={items} sticky onChange={onChange} />
            <ModalHeader
              vehicle={currentVehicle}
              transferOrderStates={TransferOrdersState}
              defaultStateId={STATUS.TR.SIN_INICIAR}
              showState={true}
            />
            <hr style={{ marginBottom: ".5rem" }} />
            <TimelineEvents events={timelineItems} />
          </>
        )}
      </Skeleton>
    </aside>
  );
};

export default ModalResumeTracking;
