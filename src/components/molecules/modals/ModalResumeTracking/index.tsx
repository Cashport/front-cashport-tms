import { FC, useMemo, useState } from "react";
import useSWR from "swr";
import {
  CaretDoubleRight,
  Receipt,
  ArrowLineDown,
  ArrowsClockwise,
  CaretDown
} from "phosphor-react";
import styles from "./ModalResumeTracking.module.scss";
import { Dropdown, MenuProps, Skeleton, Typography, message } from "antd";
import InvoiceDownloadModal from "@/modules/clients/components/invoice-download-modal/invoice-download-modal";
import UiTab from "@/components/ui/ui-tab";
import { TransferOrdersState } from "@/utils/constants/transferOrdersState";
import { STATUS } from "@/utils/constants/globalConstants";
import { fetcher } from "@/utils/api/api";
import dayjs from "dayjs";
import "dayjs/locale/es"; // Importar el idioma español
import { formatMoney } from "@/utils/utils";
import { ApiResponse, VehicleTracking } from "@/types/logistics/tracking/tracking";
import React from "react";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { ModalVehicleFollowUp } from "./components/ModalVehicleFollowUp";
import ModalHeader from "./components/ModalHeader";
import { updateTripTrackingStatus } from "@/services/logistics/tracking";

const { Text } = Typography;
interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  idTR: number;
}
export const TrackingStepState = [
  {
    name: "Abierta",
    bgColor: "#CBE71E",
    textColor: "#141414"
  },
  {
    name: "Cerrada",
    bgColor: "#495057",
    textColor: "#FFFFFF"
  }
];

const ModalResumeTracking: FC<InvoiceDetailModalProps> = ({ isOpen, onClose, idTR }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<string>("1");
  const [isModalChangeStatus, setisModalChangeStatus] = useState(false);
  const [newTripStatus, setNewTripStatus] = useState<string>(STATUS.TR.POR_ACEPTAR);

  const [comment, setComment] = useState<string>("");
  const [isLoadingChangeStatus, setIsLoadingChangeStatus] = useState<boolean>(false);
  const onChange = (key: string) => setActiveKey(key);

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<VehicleTracking[]>>(
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

  const getState = (stateId: string) => {
    let getState = TransferOrdersState.find((f) => f.id === stateId);
    if (!getState) {
      getState = TransferOrdersState.find((f) => f.id === STATUS.TR.SIN_INICIAR);
    }

    return (
      <div className={styles.trackStateContainer}>
        <Text className={styles.trackState} style={{ backgroundColor: getState?.bgColor }}>
          {getState?.name}
        </Text>
      </div>
    );
  };
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
  // const getStepState = (stateName: string) => {
  //   const getState = TrackingStepState.find((f) => f.name === stateName);
  //   return (
  //     <div className={styles.trackStateContainer}>
  //       <Text
  //         className={styles.stepState}
  //         style={{ backgroundColor: getState?.bgColor, color: getState?.textColor }}
  //       >
  //         {getState?.name}
  //       </Text>
  //     </div>
  //   );
  // };

  const getStateDropdown = (stateId: string) => {
    let getState = TransferOrdersState.find((f) => f.id === stateId);
    if (!getState) {
      getState = TransferOrdersState.find((f) => f.id === "d33e062f-51a5-457e-946e-a45cbbffbf95");
    }

    return (
      <div className={styles.trackStateContainer}>
        <Text className={styles.trackState} style={{ backgroundColor: getState?.bgColor }}>
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
  console.log("tripStatus", currentVehicle?.state_id, newTripStatus);
  return (
    <aside className={`${styles.wrapper} ${isOpen ? styles.show : styles.hide}`}>
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
      <InvoiceDownloadModal isModalOpen={isModalOpen} handleCloseModal={setIsModalOpen} />
      <div>
        <div className={styles.header}>
          <button type="button" className={styles.buttonBack} onClick={onClose}>
            <CaretDoubleRight />
          </button>
          <h4 className={styles.numberInvoice}>Tracking</h4>
          <div className={styles.viewInvoice}>
            <Receipt size={20} />
            Ver MT
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
              <hr />
              <div className={styles.body}>
                <div className={styles.content}>
                  <div className={styles.progress}></div>
                  <div className={styles.description}>
                    <div className={styles.stepperContainer}>
                      <div className={styles.stepperContent}>
                        {(timeLineData ?? []).map((item) => {
                          return (
                            <div key={item.id} className={styles.mainStep}>
                              <div className={`${styles.stepLine} ${styles.active}`} />
                              <div className={`${styles.stepCircle} ${styles.active}`} />
                              <div className={styles.stepLabel}>
                                <div className={styles.cardInvoiceFiling}>
                                  <div
                                    style={{ display: "flex", alignItems: "center", gap: "10px" }}
                                  >
                                    <h5 className={styles.title}>{item.event_description}</h5>
                                    {/* {item.status && getStepState(item.status)}
                    {item.} */}
                                  </div>
                                  <div className={styles.date}>{formatDate(item.event_time)}</div>
                                  {item.created_by && (
                                    <div
                                      className={styles.name}
                                    >{`Usuario: ${item.created_by}`}</div>
                                  )}
                                  {item.url_photo && (
                                    <div>
                                      <div className={styles.icons}>
                                        <ArrowLineDown
                                          size={14}
                                          onClick={() => {
                                            setIsModalOpen(true);
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                  {item.responsible && (
                                    <div
                                      className={styles.name}
                                    >{`Responsable: ${item.responsible}`}</div>
                                  )}
                                  {item.estimatedValue && (
                                    <p className={styles.name}>
                                      {`Valor estimado: `}
                                      <span style={{ fontWeight: 600 }}>
                                        {formatMoney(item.estimatedValue ?? "0")}
                                      </span>
                                    </p>
                                  )}
                                  {item.distanceKm && (
                                    <div className={styles.name}>
                                      {`# Kms: `}
                                      <span style={{ fontWeight: 600 }}>{item.distanceKm}</span>
                                    </div>
                                  )}
                                  {item.hours && (
                                    <div className={styles.name}>{`# Hrs: ${item.hours}`}</div>
                                  )}
                                  {item.rate && (
                                    <div className={styles.name}>
                                      {`Tarifa: `}
                                      <span style={{ fontWeight: 600 }}>
                                        {formatMoney(item.rate ?? "0")}
                                      </span>
                                    </div>
                                  )}
                                  {item.driver && (
                                    <div className={styles.name}>{`Conductor: ${item.driver}`}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </Skeleton>
      </div>
    </aside>
  );
};

export default ModalResumeTracking;
