import { Flex, Typography, message, Row, Col, TabsProps, Tabs } from "antd";
import React, { useEffect, useState, useContext } from "react";

// components
import { SideBar } from "@/components/molecules/SideBar/SideBar";
import { NavRightSection } from "@/components/atoms/NavRightSection/NavRightSection";

import { IListData, ILocation } from "@/types/logistics/schema";

//locations
import { getAllLocations } from "@/services/logistics/locations";

import { useRouter } from "next/navigation";

import "../../../../../styles/_variables_logistics.css";

import "./carrierInfoConfig.scss";
import { CarrierTable } from "@/components/molecules/tables/logistics/carrierTable/carrierTableConfig";
import { LocationsTable } from "@/components/molecules/tables/logistics/locationsTable/locationsTable";

const { Title } = Typography;

export const CarrierInfoConfigView = () => {
  const { push } = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [routeInfo, setRouteInfo] = useState([]);
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [locationOptions, setLocationOptions] = useState<any>([]);
  const [value, setValue] = useState("4");

  const onChange = (key: string) => {
    setValue(key);
  };

  console.log("routeInfo==>", routeInfo);

  useEffect(() => {
    loadLocations();
  });

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Reglas de Negocio",
      children: <></>
    },
    {
      key: "2",
      label: "Materiales",
      children: <></>
    },
    {
      key: "3",
      label: "Usuarios",
      children: <></>
    },
    {
      key: "4",
      label: "Proveedores",
      children: <CarrierTable />
    },
    {
      key: "5",
      label: "Ubicacion",
      children: <LocationsTable />
    },
    {
      key: "6",
      label: "Grupos de Ubicaciones",
      children: <></>
    },
    {
      key: "7",
      label: "Rutas de Seguridad",
      children: <></>
    }
  ];
  const loadLocations = async () => {
    if (locations.length > 0) return;
    const result = await getAllLocations();
    if (result.data.length > 0) {
      console.log(result.data);

      const listlocations: any[] | ((prevState: ILocation[]) => ILocation[]) = [];
      const listlocationoptions: { label: any; value: any }[] = [];

      result.data.forEach((item, index) => {
        listlocations.push(item);
        listlocationoptions.push({ label: item.description, value: item.id });
      });

      setLocations(listlocations);
      setLocationOptions(listlocationoptions);

      console.log(locations);
      console.log(locationOptions);
    }
  };

  return (
    <>
      {contextHolder}
      <main className="mainCreateOrder">
        <SideBar />
        <Flex vertical className="containerCreateOrder">
          <Flex className="infoHeaderOrder">
            <Flex gap={"2rem"}>
              <Title level={2} className="titleName">
                Configuración
              </Title>
            </Flex>
            <Flex component={"navbar"} align="center" justify="space-between">
              <NavRightSection />
            </Flex>
          </Flex>
          {/* ------------Main Info Order-------------- */}
          <Flex className="orderContainer">
            <Row style={{ width: "100%" }}>
              <Col span={24}>
                <Tabs defaultActiveKey={value} items={items} onChange={onChange}></Tabs>
              </Col>
            </Row>
          </Flex>
        </Flex>
      </main>
    </>
  );
};
