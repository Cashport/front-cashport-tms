import { Checkbox, CollapseProps, Spin } from "antd";
import styles from "./InProcess.module.scss";
import { TransferOrdersState } from "@/utils/constants/transferOrdersState";
import { TransferOrdersTable } from "@/components/molecules/tables/TransferOrderTable/TransferOrderTable";
import { FC, useEffect, useState } from "react";
import { ITransferRequestResponse } from "@/types/transferRequest/ITransferRequest";
import { getOnRouteTransferRequest } from "@/services/logistics/transfer-request";
import CustomCollapse from "@/components/ui/custom-collapse/CustomCollapse";
import { STATUS } from "@/utils/constants/globalConstants";
import { useSearchContext } from "@/context/SearchContext";

interface IInProcessProps {
  trsIds: number[];
  handleCheckboxChangeTR: (id: number, checked: boolean) => void;
  modalState: boolean;
}

export const InProcess: FC<IInProcessProps> = ({ trsIds, handleCheckboxChangeTR, modalState }) => {
  const { searchQuery: search } = useSearchContext();

  const [isLoadingMain, setIsLoadingMain] = useState<boolean>(false);
  const [isLoadingPagination, setIsLoadingPagination] = useState<boolean>(false);
  const [transferRequest, setTransferRequest] = useState<ITransferRequestResponse[]>([]);

  const getTitile = (stateId: string, number: number) => {
    const getState = TransferOrdersState.find((f) => f.id === stateId);
    return (
      <div className={styles.mainTitle}>
        <div className={styles.titleContainer}>
          <div className={styles.textContainer} style={{ backgroundColor: getState?.bgColor }}>
            {getState?.name}
          </div>
          <div className={`${styles.textContainer} ${styles.subTextContainer}`}>
            <span>TR</span>
            <span className={styles.number}>{number}</span>
          </div>
        </div>
      </div>
    );
  };

  const getTransferRequestAccepted = async () => {
    setIsLoadingMain(true);

    try {
      const getRequest = await getOnRouteTransferRequest(search);
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
      const getRequest = await getOnRouteTransferRequest(search, statusId, newPage);
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
    if (!modalState) {
      getTransferRequestAccepted();
    }
  }, [modalState, search]);

  const renderItems: CollapseProps["items"] = transferRequest
    .filter((item) => item?.items?.length > 0)
    .map((item, index) => {
      let aditionalRow = undefined;
      const trDeleteable = [STATUS.TR.SIN_INICIAR];
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
      }
      return {
        key: index,
        label: getTitile(item.statusId, item.page.totalRows),
        children: (
          <TransferOrdersTable
            showColumn={false}
            aditionalRow={aditionalRow}
            items={item.items}
            pagination={item.page}
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
