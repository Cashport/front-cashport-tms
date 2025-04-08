"use client";
import React, { useState } from "react";
import { Flex, Spin } from "antd";
import LabelCollapse from "@/components/ui/label-collapse";
import CarrierTable from "@/components/molecules/tables/CarrierTable/CarrierTable";
import styles from "./AceptCarrierView.module.scss";
import CustomCollapse from "@/components/ui/custom-collapse/CustomCollapse";
import { CarrierCollapseAPI } from "@/types/logistics/carrier/carrier";

interface AceptCarrierViewProps {
  carriers: CarrierCollapseAPI[];
  loading: boolean;
  // eslint-disable-next-line no-unused-vars
  getAceptCarrierRequestListByStatusId: (statusId?: string, newPage?: number) => Promise<void>;
}

export default function AceptCarrierView({
  carriers,
  loading,
  getAceptCarrierRequestListByStatusId
}: AceptCarrierViewProps) {
  console.log("carriers", carriers);
  const [selectedRows, setSelectedRows] = useState<any[] | undefined>();

  return (
    <Flex vertical className={styles.wrapper}>
      {loading ? (
        <Spin style={{ margin: "auto", padding: "200px" }} />
      ) : (
        <CustomCollapse
          defaultActiveKey={"0"}
          items={
            carriers
              ? Object.entries(carriers).map(([key, carriersState]) => ({
                  key: key,
                  label: (
                    <LabelCollapse
                      status={carriersState.description}
                      quantity={carriersState.page?.totalRows}
                      color={carriersState.color}
                      quantityText="CR"
                      removeIcons
                    />
                  ),
                  children: (
                    <CarrierTable
                      carrierData={carriersState}
                      setSelectedRows={setSelectedRows}
                      loading={loading}
                      fetchData={(newPage: number) =>
                        getAceptCarrierRequestListByStatusId(carriersState.statusid, newPage)
                      }
                    />
                  )
                }))
              : []
          }
        />
      )}
    </Flex>
  );
}
