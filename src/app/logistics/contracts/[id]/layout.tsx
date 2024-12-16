"use client";

import { Flex, Typography, Row, Col, Tabs, TabsProps } from "antd";
import { SideBar } from "@/components/molecules/SideBar/SideBar";
import { NavRightSection } from "@/components/atoms/NavRightSection/NavRightSection";
import { usePathname, useRouter } from "next/navigation";
import "./provider.scss";
import "@/styles/_variables_logistics.css";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import Container from "@/components/atoms/Container/Container";

interface Props {
  children?: React.ReactNode;
  params: {
    id: string;
  };
}

const { Title } = Typography;

const ContractInfoView = ({ children, params }: Props) => {
  const router = useRouter();
  const path = usePathname();

  const getDefaultValue = () => {
    return "";
  };

  const onChange = (key: string) => {
    router.push(`/logistics/contracts/${params.id}/${key}`);
  };
  const items: TabsProps["items"] = [
    {
      key: "",
      label: "General",
      children: <></>
    },
    {
      key: "",
      label: "Tarifas por Horas",
      children: <></>
    },
    {
      key: "",
      label: "Tarifas por KM",
      children: <></>
    },
    {
      key: "",
      label: "Tarifas por Trayectos",
      children: <></>
    },
    {
      key: "",
      label: "Otros Servicios",
      children: <></>
    }
  ];

  return (
    <ViewWrapper headerTitle="Contratos">
      <Container>
        <Tabs defaultActiveKey={getDefaultValue()} items={items} onChange={onChange} />
        {children}
      </Container>
    </ViewWrapper>
  );
};

export default ContractInfoView;
