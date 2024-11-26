import { Checkbox, CollapseProps, Spin } from "antd";
import styles from "./InProcess.module.scss";
import { TransferOrdersState } from "@/utils/constants/transferOrdersState";
import { TransferOrdersTable } from "@/components/molecules/tables/TransferOrderTable/TransferOrderTable";
import { FC, useEffect, useState } from "react";
import { ITransferRequestResponse } from "@/types/transferRequest/ITransferRequest";
import { getOnRouteTransferRequest } from "@/services/logistics/transfer-request";
import CustomCollapse from "@/components/ui/custom-collapse/CustomCollapse";
import { STATUS } from "@/utils/constants/globalConstants";
import { useSearch } from "@/context/SearchContext";

interface IInProcessProps {
  trsIds: number[];
  handleCheckboxChangeTR: (id: number, checked: boolean) => void;
  modalState: boolean;
}

export const InProcess: FC<IInProcessProps> = ({ trsIds, handleCheckboxChangeTR, modalState }) => {
  const { searchQuery: search } = useSearch();
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
    try {
      const getRequest = await getOnRouteTransferRequest(search);
      if (Array.isArray(getRequest)) {
        setTransferRequest(getRequest);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getTransferRequestAccepted();
  }, [search]);

  useEffect(() => {
    if (!modalState) {
      getTransferRequestAccepted();
    }
  }, [modalState]);

  const renderItems: CollapseProps["items"] = transferRequest.map((item, index) => {
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
      label: getTitile(item.statusId, item.items.length),
      children: (
        <TransferOrdersTable
          showColumn={false}
          aditionalRow={aditionalRow}
          items={item.items}
          pagination={item.page}
          fetchData={(newPage, rowsPerPage) =>
            getOnRouteTransferRequest(search, item.statusId, newPage, rowsPerPage)
          }
        />
      )
    };
  });

  if (isLoading)
    return (
      <div className={styles.emptyContainer}>
        <Spin size="large" />
      </div>
    );

  return <CustomCollapse ghost items={renderItems} defaultActiveKey={["0"]} />;
};
