import { Button } from "antd";
import Link from "next/link";
import {
  User,
  BellSimpleRinging,
  Megaphone,
  Bank,
  TrendUp,
  Gear,
  UsersThree,
  MapPin,
  Truck,
  CurrencyCircleDollar,
  Receipt,
  ClipboardText
} from "phosphor-react";

import { checkUserViewPermissions } from "@/utils/utils";
import { ISelectedProject } from "@/lib/slices/createProjectSlice";

import useScreenHeight from "@/components/hooks/useScreenHeight";
import useScreenWidth from "@/components/hooks/useScreenWidth";

import "./modulesButtons.scss";
import { ChatCircleDots } from "@phosphor-icons/react";

interface ModulesButtonsProps {
  isSideBarLarge: boolean;
  path: string;
  project: ISelectedProject | undefined;
  isMobileMenu?: boolean;
}

/**
 * ModulesButtons component renders navigation buttons for different modules
 * based on user permissions. Buttons are displayed in the SideBar.
 */
export const ModulesButtons = ({
  isSideBarLarge,
  path,
  project,
  isMobileMenu
}: ModulesButtonsProps) => {
  const height = useScreenHeight();
  const width = useScreenWidth();
  const iconSize = (height && height >= 1000) || (width && width > 768) ? 26 : 18;

  return (
    <div className={`containerButtons ${isMobileMenu ? "mobile" : ""}`}>
      {checkUserViewPermissions(project, "Clientes") && (
        <Link href="/clientes/all">
          <Button
            type="primary"
            size="large"
            icon={<User size={iconSize} />}
            className={path.startsWith("/clientes") ? "buttonIcon" : "buttonIconActive"}
          >
            {isSideBarLarge && "Clientes"}
          </Button>
        </Link>
      )}
      {checkUserViewPermissions(project, "Descuentos") && (
        <Link href="/descuentos" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<BellSimpleRinging size={iconSize} />}
            className={path.startsWith("/descuentos") ? "buttonIcon" : "buttonIconActive"}
          >
            {isSideBarLarge && "Descuentos"}
          </Button>
        </Link>
      )}
      {checkUserViewPermissions(project, "Notificaciones") && (
        <Link href="/notificaciones" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<BellSimpleRinging size={iconSize} />}
            className={path.startsWith("/notificaciones") ? "buttonIcon" : "buttonIconActive"}
          >
            {isSideBarLarge && "Notificaciones"}
          </Button>
        </Link>
      )}

      {checkUserViewPermissions(project, "Marketplace") && (
        <Link href="/comercio" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<Megaphone size={iconSize} />}
            className={path.startsWith("/comercio") ? "buttonIcon" : "buttonIconActive"}
          >
            {isSideBarLarge && "Descuentos"}
          </Button>
        </Link>
      )}

      {checkUserViewPermissions(project, "Bancos") && (
        <Link href="/banco" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<Bank size={iconSize} />}
            className={path === "/banco" ? "buttonIcon" : "buttonIconActive"}
          >
            {isSideBarLarge && "Bancos"}
          </Button>
        </Link>
      )}

      {checkUserViewPermissions(project, "Contratos") && (
        <Link href="/logistics/contracts/all" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<TrendUp size={iconSize} />}
            className={path.startsWith("/logistics/contracts") ? "buttonIcon" : "buttonIconActive"}
          >
            {isSideBarLarge && "Ajustes"}
          </Button>
        </Link>
      )}
      {checkUserViewPermissions(project, "Configuracion") && (
        <Link href="/" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<Gear size={iconSize} />}
            className={
              path === "/" || path.startsWith("/proyectos/review")
                ? "buttonIcon"
                : "buttonIconActive"
            }
          >
            {isSideBarLarge && "Ajustes"}
          </Button>
        </Link>
      )}
      {checkUserViewPermissions(project, "TMS-Proveedores") && (
        <Link href="/logistics/providers/all" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<UsersThree size={iconSize} />}
            className={path.startsWith("/logistics/providers") ? "buttonIcon" : "buttonIconActive"}
          >
            {isSideBarLarge && "Clientes"}
          </Button>
        </Link>
      )}
      {checkUserViewPermissions(project, "TMS-Dashboard") && (
        <Link href="/map" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<MapPin size={iconSize} />}
            className={path.startsWith("/map") ? "buttonIcon" : "buttonIconActive"}
          >
            {isSideBarLarge && "Ajustes"}
          </Button>
        </Link>
      )}
      {checkUserViewPermissions(project, "TMS-Viajes") && (
        <Link href="/logistics/transfer-orders" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<Truck size={iconSize} />}
            className={
              path.startsWith("/logistics/transfer-orders") || path.startsWith("/logistics/orders")
                ? "buttonIcon"
                : "buttonIconActive"
            }
          >
            {isSideBarLarge && "Ajustes"}
          </Button>
        </Link>
      )}
      {checkUserViewPermissions(project, "TMS-AceptacionProveedor") && (
        <Link href="/logistics/acept_carrier" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<CurrencyCircleDollar size={iconSize} />}
            className={
              path.startsWith("/logistics/acept_carrier") ? "buttonIcon" : "buttonIconActive"
            }
          >
            {isSideBarLarge && "Proveedores"}
          </Button>
        </Link>
      )}
      {checkUserViewPermissions(project, "TMS-Facturacion") && (
        <Link href="/facturacion" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<Receipt size={iconSize} />}
            className={path.startsWith("/facturacion") ? "buttonIcon" : "buttonIconActive"}
          >
            {isSideBarLarge && "Proveedores"}
          </Button>
        </Link>
      )}
      {checkUserViewPermissions(project, "TMS-Configuracion") && (
        <Link href="/logistics/configuration" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<Gear size={iconSize} />}
            className={
              path.startsWith("/logistics/configuration") ? "buttonIcon" : "buttonIconActive"
            }
          >
            {isSideBarLarge && "Ajustes"}
          </Button>
        </Link>
      )}
      {checkUserViewPermissions(project, "TMS-Tareas") && (
        <Link href="/gestor-tareas" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<ClipboardText size={iconSize} />}
            className={path === "/gestor-tareas" ? "buttonIcon" : "buttonIconActive"}
          >
            {isSideBarLarge && "Tareas"}
          </Button>
        </Link>
      )}
      {checkUserViewPermissions(project, "TMS-Whatsapp") && (
        <Link href="/chat" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<ChatCircleDots size={iconSize} />}
            className={path === "/chat" ? "buttonIcon" : "buttonIconActive"}
          >
            {isSideBarLarge && "Ajustes"}
          </Button>
        </Link>
      )}
    </div>
  );
};
