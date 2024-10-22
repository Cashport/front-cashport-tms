import { Checkbox, CollapseProps, Spin, Typography } from "antd";
import styles from "./Request.module.scss";
import { TransferOrdersState } from "@/utils/constants/transferOrdersState";
import { TransferOrdersTable } from "@/components/molecules/tables/TransferOrderTable/TransferOrderTable";
import { FC, useEffect, useState } from "react";
import { getAcceptedTransferRequest } from "@/services/logistics/transfer-request";
import { ITransferRequestResponse } from "@/types/transferRequest/ITransferRequest";
import CustomCollapse from "@/components/ui/custom-collapse/CustomCollapse";
import { STATUS } from "@/utils/constants/globalConstants";
import Loader from "@/components/atoms/loaders/loader";

const Text = Typography;

interface IRequestProps {
  search: string;
  handleCheckboxChange: (id: number, checked: boolean) => void;
  ordersId: number[];
  trsIds: number[];
  handleCheckboxChangeTR: (id: number, checked: boolean) => void;
  modalState: boolean;
}

export const Request: FC<IRequestProps> = ({
  search,
  handleCheckboxChange,
  ordersId,
  trsIds,
  handleCheckboxChangeTR,
  modalState
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [transferRequest, setTransferRequest] = useState<ITransferRequestResponse[]>([]);

  const getTitile = (stateId: string, transferType: string, number: number) => {
    const getState = TransferOrdersState.find((f) => f.id === stateId);
    return (
      <div className={styles.mainTitle}>
        <div className={styles.titleContainer}>
          <div className={styles.textContainer} style={{ backgroundColor: getState?.bgColor }}>
            {getState?.name}
          </div>
          <div className={`${styles.textContainer} ${styles.subTextContainer}`}>
            <span>{transferType}</span>
            <span className={styles.number}>{number}</span>
          </div>
        </div>
      </div>
    );
  };

  const getTransferRequestAccepted = async () => {
    try {
      const getRequest = await getAcceptedTransferRequest();
      if (Array.isArray(getRequest)) {
        setTransferRequest(getRequest);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!modalState) {
      getTransferRequestAccepted();
    }
  }, [modalState]);

  useEffect(() => {
    getTransferRequestAccepted();
  }, []);

  if (isLoading)
    return (
      <div className={styles.emptyContainer}>
        <Spin size="large" />
      </div>
    );

  const filteredData = transferRequest
    .map((status) => {
      const filteredItems = status.items.filter(
        (item) =>
          item.start_location.toLowerCase().includes(search.toLowerCase()) ||
          item.end_location.toLowerCase().includes(search.toLowerCase()) ||
          item.id.toString().includes(search.toLowerCase())
      );

      return { ...status, items: filteredItems };
    })
    .filter((status) => status.items.length > 0);

  // Array con los IDs de estado en el orden deseado
  const ORDERED_STATE_IDS = [
    STATUS.TO.SIN_PROCESAR, // Sin procesar
    STATUS.TO.PROCESANDO, // Procesando
    STATUS.TO.PROCESADO, // Procesando
    STATUS.TR.ASIGNANDO_VEHICULO, // Procesado
    STATUS.TR.ESPERANDO_PROVEEDOR // Esperando proveedor
  ];

  const sortedFilteredData = filteredData.toSorted((a, b) => {
    return ORDERED_STATE_IDS.indexOf(a.statusId) - ORDERED_STATE_IDS.indexOf(b.statusId);
  });

  const renderItems: CollapseProps["items"] = sortedFilteredData.map((item, index) => {
    let aditionalRow = undefined;
    let redirect = undefined;
    if (item.statusId === TransferOrdersState.find((f) => f.name === "Sin procesar")?.id) {
      aditionalRow = {
        title: "",
        dataIndex: "checkbox",
        render: (_: any, { tr }: any) => (
          <Checkbox
            checked={ordersId.includes(tr)}
            onChange={(e) => handleCheckboxChange(tr, e.target.checked)}
          />
        )
      };
      redirect = "/logistics/orders/details";
    }
    const trDeleteable = [STATUS.TR.ASIGNANDO_VEHICULO];
    if (trDeleteable.includes(item.statusId)) {
      aditionalRow = {
        title: "",
        dataIndex: "checkbox",
        render: (_: any, { tr }: any) => (
          <Checkbox
            checked={trsIds.includes(tr)}
            onChange={(e) => handleCheckboxChangeTR(tr, e.target.checked)}
          />
        )
      };
      redirect = "/logistics/transfer-request/";
    }
    if (item.statusId === TransferOrdersState.find((f) => f.name === "Esperando proveedor")?.id) {
      redirect = "/logistics/transfer-request/";
    }
    const statusToDetailsTO = [STATUS.TO.SIN_PROCESAR, STATUS.TO.PROCESANDO, STATUS.TO.PROCESADO];
    if (statusToDetailsTO.includes(item.statusId)) {
      redirect = "/logistics/orders/details";
    }
    return {
      key: index,
      label: getTitile(item.statusId, item.transferType, item.items.length),
      children: (
        <TransferOrdersTable items={item.items} aditionalRow={aditionalRow} redirect={redirect} />
      )
    };
  });

  return <CustomCollapse ghost items={renderItems} defaultActiveKey={["0"]} />;
};
