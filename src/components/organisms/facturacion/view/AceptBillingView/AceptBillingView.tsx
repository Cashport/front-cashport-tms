"use client";
import React, { useState } from "react";
import { Flex } from "antd";
import LabelCollapse from "@/components/ui/label-collapse";
import BillingTable from "@/components/molecules/tables/BillingTable/BillingTable";
import styles from "./AceptBillingView.module.scss";
import { IBillingsRequestList } from "@/types/logistics/billing/billing";
import CustomCollapse from "@/components/ui/custom-collapse/CustomCollapse";

interface AceptBillingViewProps {
  billings: IBillingsRequestList[];
  loading: boolean;
  // eslint-disable-next-line no-unused-vars
  getBillingListdByStatusId: (statusId?: string, newPage?: number) => Promise<void>;
}

export default function AceptBillingView({
  billings,
  loading,
  getBillingListdByStatusId
}: AceptBillingViewProps) {
  const [selectedRows, setSelectedRows] = useState<any[] | undefined>();

  return (
    <Flex vertical className={styles.wrapper}>
      <CustomCollapse
        className={styles.collapses}
        defaultActiveKey={"0"}
        items={
          billings
            ? Object.entries(billings).map(([key, billingsState]) => ({
                key: key,
                label: (
                  <LabelCollapse
                    status={billingsState.statusDesc}
                    quantity={billingsState.page?.totalRows}
                    color={billingsState.statusColor}
                    quantityText="TR"
                    removeIcons
                  />
                ),
                children: (
                  <BillingTable
                    billingData={billingsState}
                    fetchData={(newPage: number) =>
                      getBillingListdByStatusId(billingsState.statusId, newPage)
                    }
                    setSelectedRows={setSelectedRows}
                    loading={loading}
                  />
                )
              }))
            : []
        }
      />
    </Flex>
  );
}
