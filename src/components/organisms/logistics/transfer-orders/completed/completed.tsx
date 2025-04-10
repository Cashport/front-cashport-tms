import { TransferOrdersState } from "@/utils/constants/transferOrdersState";
import styles from "./completed.module.scss";
import { Checkbox, CollapseProps, Spin } from "antd";
import {
  DataTypeForTransferOrderTable,
  TransferOrdersTable
} from "@/components/molecules/tables/TransferOrderTable/TransferOrderTable";
import { FC, useEffect, useState } from "react";
import { ITransferRequestResponse } from "@/types/transferRequest/ITransferRequest";
import { getFinishedTransferRequest } from "@/services/logistics/transfer-request";
import CustomCollapse from "@/components/ui/custom-collapse/CustomCollapse";
import { useSearchContext } from "@/context/SearchContext";

interface ICompletedProps {
  handleCheckAll: (row: DataTypeForTransferOrderTable, isChecked: boolean) => void;
  allSelectedRows?: DataTypeForTransferOrderTable[];
}

export const Completed: FC<ICompletedProps> = ({ allSelectedRows, handleCheckAll }) => {
  const { searchQuery: search, vpQuery, pslQuery } = useSearchContext();

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
      const getRequest = await getFinishedTransferRequest(search, pslQuery, vpQuery);
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
      const getRequest = await getFinishedTransferRequest(
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
    getTransferRequestAccepted();
  }, [search, vpQuery, pslQuery]);

  const renderItems: CollapseProps["items"] = transferRequest
    .filter((item) => item?.items?.length > 0) // Filtrar los que tengan al menos un elemento
    .map((item, index) => {
      const aditionalRow = {
        title: "",
        dataIndex: "checkbox",
        width: 50,
        render: (_: any, row: DataTypeForTransferOrderTable) => {
          const tr = row.tr;
          return (
            <Checkbox
              checked={allSelectedRows?.some((selectedRow) => selectedRow.tr === tr)}
              onChange={(e) => {
                const isChecked = e.target.checked;
                // Handle the "select all" functionality
                handleCheckAll(row, isChecked);
              }}
            />
          );
        }
      };
      return {
        key: item.statusId,
        label: getTitile(item.statusId, item.page.totalRows),
        children: (
          <TransferOrdersTable
            showColumn={false}
            showCarriersColumn={true}
            items={item.items}
            pagination={item.page}
            loading={isLoadingPagination}
            fetchData={(newPage: number) =>
              getTransferRequestAcceptedByStatusId(item.statusId, newPage)
            }
            aditionalRow={aditionalRow}
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
