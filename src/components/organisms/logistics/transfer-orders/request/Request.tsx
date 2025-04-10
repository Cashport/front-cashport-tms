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
  handleCheckboxChange: (id: string, checked: boolean, row: DataTypeForTransferOrderTable) => void;
  ordersId: string[];
  trsIds: string[];
  handleCheckboxChangeTR: (
    id: string,
    checked: boolean,
    row: DataTypeForTransferOrderTable
  ) => void;
  modalState: boolean;
  mutateData?: boolean;
  allSelectedRows?: DataTypeForTransferOrderTable[];
  handleCheckAll: (row: DataTypeForTransferOrderTable, isChecked: boolean) => void;
}

export const Request: FC<IRequestProps> = ({
  handleCheckboxChange,
  ordersId,
  trsIds,
  handleCheckboxChangeTR,
  modalState,
  mutateData,
  allSelectedRows,
  handleCheckAll
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
      // Default aditionalRow with Checkbox
      const aditionalRow = {
        title: "",
        dataIndex: "checkbox",
        width: 50,
        render: (_: any, row: DataTypeForTransferOrderTable) => (
          <Checkbox
            checked={allSelectedRows?.some((selectedRow) => selectedRow.tr === row.tr)}
            onChange={(e) => {
              const isChecked = e.target.checked;
              const rowId = row.tr;

              // First handle the "select all" functionality
              handleCheckAll(row, isChecked);

              // Then handle specific status-based checks
              if (
                item.statusId === TransferOrdersState.find((f) => f.name === "Sin procesar")?.id
              ) {
                handleCheckboxChange(rowId, isChecked, row);
              } else if (
                [STATUS.TR.ASIGNANDO_VEHICULO, STATUS.TR.ESPERANDO_PROVEEDOR].includes(
                  item.statusId
                )
              ) {
                handleCheckboxChangeTR(rowId, isChecked, row);
              }
            }}
          />
        )
      };

      let redirect = undefined;
      let showBothIds = false;
      let trShouldRedirect = false;
      const trDeleteable = [STATUS.TR.ASIGNANDO_VEHICULO, STATUS.TR.ESPERANDO_PROVEEDOR];

      if (item.statusId === TransferOrdersState.find((f) => f.name === "Sin procesar")?.id) {
        redirect = "/logistics/orders/details";
      } else if (trDeleteable.includes(item.statusId)) {
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
