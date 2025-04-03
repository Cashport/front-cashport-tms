import { Checkbox, CollapseProps, Spin } from "antd";
import styles from "./Request.module.scss";
import { TransferOrdersState } from "@/utils/constants/transferOrdersState";
import {
  DataTypeForTransferOrderTable,
  TransferOrdersTable
} from "@/components/molecules/tables/TransferOrderTable/TransferOrderTable";
import { FC, useEffect, useState } from "react";
import { getAcceptedTransferRequest } from "@/services/logistics/transfer-request";
import { ITransferRequestResponse } from "@/types/transferRequest/ITransferRequest";
import CustomCollapse from "@/components/ui/custom-collapse/CustomCollapse";
import { STATUS } from "@/utils/constants/globalConstants";
import { useSearchContext } from "@/context/SearchContext";

interface IRequestProps {
  handleCheckboxChange: (id: number, checked: boolean) => void;
  ordersId: number[];
  trsIds: string[];
  handleCheckboxChangeTR: (
    id: string,
    checked: boolean,
    row: DataTypeForTransferOrderTable
  ) => void;
  modalState: boolean;
  mutateData?: boolean;
}

export const Request: FC<IRequestProps> = ({
  handleCheckboxChange,
  ordersId,
  trsIds,
  handleCheckboxChangeTR,
  modalState,
  mutateData
}) => {
  const [isLoadingMain, setIsLoadingMain] = useState<boolean>(false);
  const [isLoadingPagination, setIsLoadingPagination] = useState<boolean>(false);
  const [transferRequest, setTransferRequest] = useState<ITransferRequestResponse[]>([]);
  const { searchQuery: search, pslQuery, vpQuery } = useSearchContext();

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
    setIsLoadingMain(true);
    try {
      const getRequest = await getAcceptedTransferRequest(search, pslQuery, vpQuery);
      if (Array.isArray(getRequest)) {
        setTransferRequest(getRequest);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingMain(false);
    }
  };

  const getTransferRequestAcceptedByStatusId = async (statusId?: string, newPage?: number) => {
    setIsLoadingPagination(true);
    try {
      const getRequest = await getAcceptedTransferRequest(
        search,
        pslQuery,
        vpQuery,
        statusId,
        newPage
      );
      if (Array.isArray(getRequest) && getRequest.length > 0) {
        // Nuevo elemento a actualizar
        const updatedItem = getRequest[0];

        setTransferRequest((prevState) =>
          prevState.map((item) => (item.statusId === updatedItem.statusId ? updatedItem : item))
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingPagination(false);
    }
  };

  useEffect(() => {
    if (!modalState || mutateData) {
      getTransferRequestAccepted();
    }
  }, [modalState, search, pslQuery, vpQuery, mutateData]);

  const renderItems: CollapseProps["items"] = transferRequest
    .filter((item) => item?.items?.length > 0)
    .map((item, index) => {
      console.log("item de donde salen los items", item);
      let aditionalRow = undefined;
      let redirect = undefined;
      let showBothIds = false;
      let trShouldRedirect = false;
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
      const trDeleteable = [STATUS.TR.ASIGNANDO_VEHICULO, STATUS.TR.ESPERANDO_PROVEEDOR];
      if (trDeleteable.includes(item.statusId)) {
        aditionalRow = {
          title: "",
          dataIndex: "checkbox",
          render: (_: any, row: DataTypeForTransferOrderTable) => {
            const { tr } = row;
            return (
              <Checkbox
                checked={trsIds.includes(tr)}
                onChange={(e) => {
                  return handleCheckboxChangeTR(tr, e.target.checked, row);
                }}
              />
            );
          }
        };
        redirect = "/logistics/transfer-request/";
      }
      const statusToDetailsTO = [
        STATUS.TO.SIN_PROCESAR,
        STATUS.TO.PROCESANDO,
        STATUS.TO.PROCESADO,
        STATUS.TO.CANCELADO
      ];
      if (statusToDetailsTO.includes(item.statusId)) {
        redirect = "/logistics/orders/details";
      }
      const tosToTR = [STATUS.TO.PROCESADO, STATUS.TO.PROCESANDO];
      if (tosToTR.includes(item.statusId)) {
        showBothIds = true;
      }
      if (item.statusId === STATUS.TO.PROCESADO) {
        trShouldRedirect = true;
      }
      if (item.statusId === STATUS.TR.CANCELADO) {
        trShouldRedirect = false;
      }
      return {
        key: index,
        label: getTitile(item.statusId, item.transferType, item.page.totalRows),
        children: (
          <TransferOrdersTable
            items={item.items}
            showCarriersColumn={false}
            pagination={item.page}
            aditionalRow={aditionalRow}
            redirect={redirect}
            showBothIds={showBothIds}
            trShouldRedirect={trShouldRedirect}
            loading={isLoadingPagination}
            fetchData={(newPage: number) =>
              getTransferRequestAcceptedByStatusId(item.statusId, newPage)
            }
          />
        )
      };
    });

  if (isLoadingMain)
    return (
      <div className={styles.emptyContainer}>
        <Spin size="large" />
      </div>
    );

  return <CustomCollapse ghost items={renderItems} defaultActiveKey={["0"]} />;
};
