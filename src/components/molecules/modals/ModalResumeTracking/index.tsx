import { FC, useState } from "react";
import {
  ArrowLineDown,
  CaretDoubleRight,
  DotsThree,
  Envelope,
  Minus,
  Plus,
  Receipt
} from "phosphor-react";
import styles from "./ModalResumeTracking.module.scss";
import { useInvoiceDetail } from "@/hooks/useInvoiceDetail";

import { Button, Flex, Tabs, TabsProps, Typography } from "antd";
import { IInvoice } from "@/types/invoices/IInvoices";
import { formatDatePlane, formatMoney } from "@/utils/utils";
import { useSWRConfig } from "swr";
import InvoiceDownloadModal from "@/modules/clients/components/invoice-download-modal/invoice-download-modal";
import { vehiclesData } from "./mocked-data";
import UiTab from "@/components/ui/ui-tab";
import { TransferOrdersState } from "@/utils/constants/transferOrdersState";
import { VehicleTracking } from "@/types/logistics/tracking/tracking";

const { Text, Link } = Typography;
interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: number;
  clientId: number;
  hiddenActions?: boolean;
  // eslint-disable-next-line no-unused-vars
  handleActionInDetail?: (invoice: IInvoice) => void;
  selectInvoice?: IInvoice;
  projectId?: number;
}
interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  responsible?: string;
  driver?: string;
  estimatedValue?: number;
  distanceKm?: number;
  rate?: number;
  hours?: number;
  status?: "Abierta" | "Cerrada";
}

const ModalResumeTracking: FC<InvoiceDetailModalProps> = ({
  isOpen,
  onClose,
  invoiceId,
  clientId,
  hiddenActions,
  projectId,
  selectInvoice,
  handleActionInDetail
}) => {
  const { mutate } = useSWRConfig();
  const { data: invoiceData } = useInvoiceDetail({ invoiceId, clientId, projectId });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(0);

  const statusClass = (status: string): string => {
    switch (status) {
      case "Identificado" || "coinciliada":
        return styles.identifiedReconciled;
      case "En auditoría":
        return styles.inAudit;
      case "No identificado":
        return styles.unidentified;
      case "aplicacion":
        return styles.applied;
      case "Ap. parcialmente":
        return styles.partially;
      case "sin conciliar":
        return styles.noReconcile;
      case "novedades":
        return styles.novelty;
      case "saldo":
        return styles.balances;
      case "glosado":
        return styles.glossed;
      case "devolucion":
        return styles.return;
      case "vencida":
        return styles.annulment;
      default:
        return "";
    }
  };
  const getState = (stateId: string) => {
    let getState = TransferOrdersState.find((f) => f.id === stateId);
    if (!getState) {
      getState = TransferOrdersState.find((f) => f.id === "d33e062f-51a5-457e-946e-a45cbbffbf95");
    }

    return (
      <div className={styles.trackStateContainer}>
        <Text className={styles.trackState} style={{ backgroundColor: getState?.bgColor }}>
          {getState?.name}
        </Text>
      </div>
    );
  };
  // const items = [
  //   {
  //     key: "1",
  //     label: "HGB 657",
  //     children: <></>
  //   },
  //   {
  //     key: "2",
  //     label: "JKM 679",
  //     children: <></>
  //   },
  //   {
  //     key: "3",
  //     label: "UJT 123",
  //     children: <></>
  //   }
  // ];
  const generateTabsFromVehicles = (vehicles: VehicleTracking[]) => {
    return vehicles.map((vehicle, index) => ({
      key: (index + 1).toString(),
      label: vehicle.plate,
      children: <></> // Aquí puedes renderizar el contenido de cada tab
    }));
  };

  // Ejemplo de uso:
  const items = generateTabsFromVehicles(vehiclesData);
  const [activeKey, setActiveKey] = useState<string>("1");
  const onChange = (key: string) => {
    setActiveKey(key);
  };
  console.log(invoiceData, "invoiceData", selectInvoice);
  const currentVehicle = vehiclesData[Number(activeKey) - 1];
  const timeLineData = currentVehicle?.trackingEvents;
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
            onClick={() => {
              mutate(`/invoice/${invoiceId}/client/${clientId}/project/${projectId}`);
              handleActionInDetail?.(selectInvoice!);
            }}
          >
            Generar acción
          </Button>
        </div>
        <UiTab tabs={items} sticky onChange={onChange} />
        <Flex justify="space-between" style={{ padding: "8px 16px 24px 8px" }}>
          <div>
            <Text>Proveedor </Text>
            <Text strong style={{ fontWeight: "bold" }}>
              {currentVehicle?.provider}
            </Text>
            <br />
            <Text>Vehículo </Text>
            <Link strong href="#" target="_blank">
              {currentVehicle?.vehicle}
            </Link>
            <br />
            <Text>Conductor </Text>
            <Link strong href="tel:3144705302">
              {currentVehicle?.driver?.name} - {currentVehicle?.driver?.phone}
            </Link>
          </div>
          {getState("b9e5ce08-16a7-4880-88a5-ebca7737c55d")}
        </Flex>
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
                            <h5 className={styles.title}>{item.title}</h5>
                            <div className={styles.date}>
                              {item.date} - {item.time}
                            </div>
                            {item.downloadUrl && (
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
      </div>
    </aside>
  );
};

export default ModalResumeTracking;
