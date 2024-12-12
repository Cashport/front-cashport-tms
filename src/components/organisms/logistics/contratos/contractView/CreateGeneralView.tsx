import { Flex, Tabs, TabsProps } from "antd";
import "./createGeneralView.scss";
import { ContractsTable } from "@/components/molecules/tables/logistics/contractTable/contractTable";
import { useState } from "react";
import { VehiclesRatesTable } from "@/components/molecules/tables/logistics/vehiclesRatesTable/VehiclesRatesTable";

export const CreateGeneralView = () => {
  const [tabActive, setTabActive] = useState<string>("1");

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Todos los contratos",
      children: <ContractsTable />
    },
    {
      key: "2",
      label: "Tarifas vehículos",
      children: <VehiclesRatesTable />
    },
    {
      key: "3",
      label: "Otros servicios / Sobrecostos",
      children: <></>
    }
  ];

  return (
    <Flex className="contractContainer">
      <Tabs
        style={{ width: "100%", height: "100%" }}
        defaultActiveKey="1"
        items={items}
        size="large"
        activeKey={tabActive}
        onChange={(newTab) => setTabActive(newTab)}
      />
    </Flex>
  );
};
