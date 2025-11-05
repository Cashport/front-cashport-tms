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
import "./modulesButtons.scss";

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
  return (
    <div className={`containerButtons ${isMobileMenu ? "mobile" : ""}`}>
      {checkUserViewPermissions(project, "Clientes") && (
        <Link href="/clientes/all">
          <Button
            type="primary"
            size="large"
            icon={<User size={26} />}
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
            icon={<BellSimpleRinging size={26} />}
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
            icon={<BellSimpleRinging size={26} />}
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
            icon={<Megaphone size={26} />}
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
            icon={<Bank size={26} />}
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
            icon={<TrendUp size={26} />}
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
            icon={<Gear size={26} />}
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
            icon={<UsersThree size={26} />}
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
            icon={<MapPin size={26} />}
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
            icon={<Truck size={26} />}
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
            icon={<CurrencyCircleDollar size={26} />}
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
            icon={<Receipt size={26} />}
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
            icon={<Gear size={26} />}
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
            icon={<ClipboardText size={26} />}
            className={path === "/gestor-tareas" ? "buttonIcon" : "buttonIconActive"}
          >
            {isSideBarLarge && "Tareas"}
          </Button>
        </Link>
      )}
      {/* {true && (
        <Link href="/chat" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<ChatCircleDots size={26} />}
            className={path === "/chat" ? "buttonIcon" : "buttonIconActive"}
          >
            {isSideBarLarge && "Ajustes"}
          </Button>
        </Link>
      )} */}
    </div>
  );
};
