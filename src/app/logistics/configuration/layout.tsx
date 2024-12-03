"use client";
import { Tabs } from "antd";
import { usePathname, useRouter } from "next/navigation";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import Container from "@/components/atoms/Container/Container";
import { TMS_COMPONENTS, TMSMODULES } from "@/utils/constants/globalConstants";
import { checkUserComponentPermissions } from "@/utils/utils";
import { useAppStore } from "@/lib/store/store";

interface Props {
  children?: React.ReactNode;
  params: {
    id: string;
  };
}

const viewName: keyof typeof TMSMODULES = "TMS-Configuracion";

const ConfigurationLayout = ({ children, params }: Props) => {
  const router = useRouter();
  const path = usePathname();

  const { selectedProject: project, isHy } = useAppStore((state) => state);

  const getDefaultValue = () => {
    if (path.includes("materials")) {
      return "materials";
    }
    if (path.includes("users")) {
      return "users";
    }
    if (path.includes("carriers")) {
      return "carriers";
    }
    if (path.includes("locations") && !path.includes("grouplocations")) {
      return "locations";
    }
    if (path.includes("grouplocations")) {
      return "grouplocations";
    }
    if (path.includes("secureroutes")) {
      return "secureroutes";
    }
    return "materials";
  };

  const onChange = (key: string) => {
    if (key == "materials") {
      //default tab
      router.push(`/logistics/configuration`);
    } else {
      router.push(`/logistics/configuration/${key}/all`);
    }
  };

  const checkFunction = ({ create_permission }: { create_permission: boolean }) =>
    create_permission;

  const items: any[] = [
    {
      key: "materials",
      label: "Materiales",
      children: <></>,
      hidden: !checkUserComponentPermissions(
        project,
        viewName,
        TMS_COMPONENTS[viewName]["MATERIALS"],
        checkFunction
      )
    },
    {
      key: "users",
      label: "Usuarios",
      children: <></>,
      disabled: false,
      hidden: !checkUserComponentPermissions(
        project,
        viewName,
        TMS_COMPONENTS[viewName]["USERS"],
        checkFunction
      )
    },
    {
      key: "locations",
      label: "Ubicación",
      children: <></>,
      hidden: !checkUserComponentPermissions(
        project,
        viewName,
        TMS_COMPONENTS[viewName]["LOCATIONS"],
        checkFunction
      )
    }
  ];

  return (
    <ViewWrapper headerTitle="Configuración">
      <Container>
        <Tabs
          defaultActiveKey={getDefaultValue()}
          activeKey={getDefaultValue()}
          items={items.filter((x: any) => !x.hidden)}
          onChange={onChange}
        />
        {children}
      </Container>
    </ViewWrapper>
  );
};

export default ConfigurationLayout;
