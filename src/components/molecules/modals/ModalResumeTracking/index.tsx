import { FC, useState } from "react";
import { ArrowLineDown, CaretDoubleRight, DotsThree, Receipt } from "phosphor-react";
import styles from "./ModalResumeTracking.module.scss";
import { Button, Flex, Typography } from "antd";
import { IInvoice } from "@/types/invoices/IInvoices";
import { formatMoney } from "@/utils/utils";
import { useSWRConfig } from "swr";
import InvoiceDownloadModal from "@/modules/clients/components/invoice-download-modal/invoice-download-modal";
import { vehiclesData } from "./mocked-data";
import UiTab from "@/components/ui/ui-tab";
import { TransferOrdersState } from "@/utils/constants/transferOrdersState";
import { VehicleTracking } from "@/types/logistics/tracking/tracking";
import { STATUS } from "@/utils/constants/globalConstants";

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

const { Text, Link } = Typography;
interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: number;
  clientId: number;
  // eslint-disable-next-line no-unused-vars
  handleActionInDetail?: (invoice: IInvoice) => void;
  selectInvoice?: IInvoice;
  projectId?: number;
}

const ModalResumeTracking: FC<InvoiceDetailModalProps> = ({
  isOpen,
  onClose,
  invoiceId,
  clientId,
  projectId,
  selectInvoice,
  handleActionInDetail
}) => {
  const { mutate } = useSWRConfig();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  const getStepState = (stateName: string) => {
    const getState = TrackingStepState.find((f) => f.name === stateName);
    return (
      <div className={styles.trackStateContainer}>
        <Text
          className={styles.stepState}
          style={{ backgroundColor: getState?.bgColor, color: getState?.textColor }}
        >
          {getState?.name}
        </Text>
      </div>
    );
  };
  const generateTabsFromVehicles = (vehicles: VehicleTracking[]) => {
    return vehicles.map((vehicle, index) => ({
      key: (index + 1).toString(),
      label: vehicle.plate,
      children: <></>
    }));
  };

  // Ejemplo de uso:
  const items = generateTabsFromVehicles(vehiclesData);
  const [activeKey, setActiveKey] = useState<string>("1");
  const onChange = (key: string) => {
    setActiveKey(key);
  };

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
        <Flex
          justify="space-between"
          style={{ padding: "8px 16px 24px 8px", alignItems: "flex-start" }}
        >
          <div>
            <Text>Proveedor </Text>
            <Text strong style={{ fontWeight: "bold" }}>
              {currentVehicle?.provider}
            </Text>
            <br />
            <Text>Vehículo </Text>
            <Link
              href="#"
              target="_blank"
              className={styles.link}
              style={{ textDecoration: "underline" }}
            >
              {currentVehicle?.vehicle}
            </Link>
            <br />
            <Text>Conductor </Text>
            <Link
              href="tel:3144705302"
              className={styles.link}
              style={{ textDecoration: "underline" }}
            >
              {currentVehicle?.driver?.name} - {currentVehicle?.driver?.phone}
            </Link>
          </div>
          {getState(currentVehicle?.status)}
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
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <h5 className={styles.title}>{item.title}</h5>
                              {item.status && getStepState(item.status)}
                            </div>
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
