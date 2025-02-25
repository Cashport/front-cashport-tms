"use client";
import { TabsProps } from "antd";
import { usePathname, useRouter } from "next/navigation";
import "./provider.scss";
import "@/styles/_variables_logistics.css";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import Container from "@/components/atoms/Container/Container";
import UiTab from "@/components/ui/ui-tab";

interface Props {
  children?: React.ReactNode;
  params: {
    id: string;
  };
}

const ProviderInfoView = ({ children, params }: Props) => {
  const router = useRouter();
  const path = usePathname();

  const getDefaultValue = () => {
    if (path.includes("driver")) {
      return "driver";
    }
    if (path.includes("vehicle")) {
      return "vehicle";
    }
    return "";
  };

  const onChange = (key: string) => {
    router.push(`/logistics/providers/${params.id}/${key}`);
  };
  const items: TabsProps["items"] = [
    {
      key: "",
      label: "General",
      children: <></>
    },
    {
      key: "vehicle",
      label: "Vehículos",
      children: <></>
    },
    {
      key: "driver",
      label: "Conductores",
      children: <></>
    }
  ];

  return (
    <ViewWrapper headerTitle="Proveedores">
      <Container>
        <UiTab defaultActiveKey={getDefaultValue()} tabs={items} onChange={onChange} />
        {children}
      </Container>
    </ViewWrapper>
  );
};

export default ProviderInfoView;
