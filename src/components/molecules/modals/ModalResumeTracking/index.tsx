import { FC, useMemo, useState } from "react";
import useSWR from "swr";
import { CaretDoubleRight, DotsThree, Receipt, ArrowLineDown } from "phosphor-react";
import styles from "./ModalResumeTracking.module.scss";
import { Button, Skeleton, Typography } from "antd";
import InvoiceDownloadModal from "@/modules/clients/components/invoice-download-modal/invoice-download-modal";
import UiTab from "@/components/ui/ui-tab";
import { TransferOrdersState } from "@/utils/constants/transferOrdersState";
import { STATUS } from "@/utils/constants/globalConstants";
import { fetcher } from "@/utils/api/api";
import dayjs from "dayjs";
import "dayjs/locale/es"; // Importar el idioma español
import { formatMoney } from "@/utils/utils";
import { ApiResponse, VehicleTracking } from "@/types/logistics/tracking/tracking";
const { Text, Link } = Typography;
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

  const onChange = (key: string) => setActiveKey(key);

  const { data, error, isLoading } = useSWR<ApiResponse<VehicleTracking[]>>(
    isOpen ? `/transfer-request/triptracking/${idTR}` : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnMount: false }
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

  return (
    <aside className={`${styles.wrapper} ${isOpen ? styles.show : styles.hide}`}>
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

          <Button
            className={styles.button__actions}
            size="large"
            icon={<DotsThree size={"1.5rem"} />}
            onClick={() => {}}
          >
            Generar acción
          </Button>
        </div>
        <Skeleton loading={isLoading} active>
          {currentVehicle && (
            <>
              <UiTab tabs={items} sticky onChange={onChange} />
              <div className={styles.currentTrip}>
                <div>
                  <Text>Proveedor </Text>
                  <Text strong style={{ fontWeight: "bold" }}>
                    {currentVehicle?.provider ?? ""}
                  </Text>
                  <br />
                  <Text>Vehículo </Text>
                  <Link
                    href={`/logistics/providers/${currentVehicle?.id_provider}/vehicle/${currentVehicle?.id_vehicle}`}
                    target="_blank"
                    className={styles.link}
                    style={{ textDecoration: "underline" }}
                  >
                    {currentVehicle?.vehicle_type ?? ""}
                  </Link>
                  <br />
                  <Text>Conductor </Text>
                  <Link
                    href={`/logistics/providers/${currentVehicle?.id_provider}/driver/${currentVehicle?.driver_id}`}
                    target="_blank"
                    className={styles.link}
                    style={{ textDecoration: "underline" }}
                  >
                    {currentVehicle?.driver_name ?? ""} - {currentVehicle?.driver_phone ?? ""}
                  </Link>
                </div>
                {getState(currentVehicle?.state_id ?? "")}
              </div>
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
