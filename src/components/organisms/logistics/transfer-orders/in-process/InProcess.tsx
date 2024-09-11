import { CollapseProps, Typography } from "antd";
import styles from "./InProcess.module.scss";
import { TransferOrdersState } from "@/utils/constants/transferOrdersState";
import { TransferOrdersTable } from "@/components/molecules/tables/TransferOrderTable/TransferOrderTable";
import { FC, useEffect, useState } from "react";
import { ITransferRequestResponse } from "@/types/transferRequest/ITransferRequest";
import { getOnRouteTransferRequest } from "@/services/logistics/transfer-request";
import CustomCollapse from "@/components/ui/custom-collapse/CustomCollapse";

const Text = Typography;

interface IInProcessProps {
  search: string;
}

export const InProcess: FC<IInProcessProps> = ({ search }) => {
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
      const getRequest = await getOnRouteTransferRequest();
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
  }, []);

  const filteredData = transferRequest.map((status) => {
    const filteredItems = status.items.filter(
      (item) =>
        item.start_location.toLowerCase().includes(search.toLowerCase()) ||
        item.end_location.toLowerCase().includes(search.toLowerCase())
    );

    return { ...status, items: filteredItems };
  });

  const renderItems: CollapseProps["items"] = filteredData.map((item, index) => {
    const hasItems = item.items.length > 0;
    return {
      key: index,
      label: getTitile(item.statusId, item.items.length),
      children: <TransferOrdersTable showColumn={false} items={item.items} />
    };
  });

  if (isLoading)
    return (
      <div className={styles.emptyContainer}>
        <Text className={styles.textEmpty}>Loading...</Text>
      </div>
    );

  return <CustomCollapse ghost items={renderItems} defaultActiveKey={["0"]} />;
};
