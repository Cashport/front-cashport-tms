import { TransferOrdersState } from "@/utils/constants/transferOrdersState";
import styles from "./completed.module.scss";
import { CollapseProps, Spin } from "antd";
import { TransferOrdersTable } from "@/components/molecules/tables/TransferOrderTable/TransferOrderTable";
import { FC, useEffect, useState } from "react";
import { ITransferRequestResponse } from "@/types/transferRequest/ITransferRequest";
import { getFinishedTransferRequest } from "@/services/logistics/transfer-request";
import CustomCollapse from "@/components/ui/custom-collapse/CustomCollapse";
import { useSearch } from "@/context/SearchContext";

interface ICompletedProps {}

export const Completed: FC<ICompletedProps> = () => {
  const { searchQuery: search } = useSearch();

  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    setIsLoading(true);

    try {
      const getRequest = await getFinishedTransferRequest(search);
      if (Array.isArray(getRequest)) {
        setTransferRequest(getRequest);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const getTransferRequestAcceptedByStatusId = async (statusId?: string, newPage?: number) => {
    setIsLoading(true);
    try {
      const getRequest = await getFinishedTransferRequest(search, statusId, newPage);
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
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getTransferRequestAccepted();
  }, [search]);

  const renderItems: CollapseProps["items"] = transferRequest
    .filter((item) => item?.items?.length > 0) // Filtrar los que tengan al menos un elemento
    .map((item, index) => ({
      key: item.statusId,
      label: getTitile(item.statusId, item.page.totalRows),
      children: (
        <TransferOrdersTable
          showColumn={false}
          items={item.items}
          pagination={item.page}
          loading={isLoading}
          fetchData={(newPage: number) =>
            getTransferRequestAcceptedByStatusId(item.statusId, newPage)
          }
        />
      )
    }));

  // if (isLoading)
  //   return (
  //     <div className={styles.emptyContainer}>
  //       <Spin size="large" />
  //     </div>
  //   );

  return <CustomCollapse ghost items={renderItems} defaultActiveKey={["0"]} />;
};
