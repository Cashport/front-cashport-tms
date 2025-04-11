"use client";
import { useEffect, useState } from "react";
import { Avatar, Button, Flex } from "antd";

import {
  ArrowLineRight,
  BellSimpleRinging,
  Gear,
  Megaphone,
  User,
  UsersThree,
  Truck,
  MapPin,
  CurrencyCircleDollar,
  Receipt,
  Clipboard,
  Bank,
  TrendUp
} from "phosphor-react";

import "./sidebar.scss";
import { usePathname, useRouter } from "next/navigation";
import { logOut } from "../../../../firebase-utils";
import Link from "next/link";
import { useAppStore } from "@/lib/store/store";
import useStore from "@/lib/hook/useStore";
import { getUserPermissions } from "@/services/permissions/userPermissions";
import { checkUserViewPermissions } from "@/utils/utils";
import { ModalProjectSelector } from "../modals/ModalProjectSelector/ModalProjectSelector";
import { TMSMODULES } from "@/utils/constants/globalConstants";
import { setProjectInApi } from "@/utils/api/api";

export const SideBar = () => {
  const [isSideBarLarge, setIsSideBarLarge] = useState(false);
  const [modalProjectSelectorOpen, setModalProjectSelectorOpen] = useState(false);
  const [isComponentLoading, setIsComponentLoading] = useState(true);
  const router = useRouter();
  const path = usePathname();
  const project = useStore(useAppStore, (state) => state.selectedProject);
  const { setProjectsBasicInfo, setSelectedProject, isHy, projectsBasicInfo } = useAppStore(
    (state) => state
  );

  const LOGO = project?.LOGO;

  useEffect(() => {
    console.log(project);
    if (isHy) setIsComponentLoading(false);
  }, [isHy, project]);

  useEffect(() => {
    //to check if there is a project selected
    //if not it should open the modal to select one
    if (isHy && !isComponentLoading && !project?.ID) {
      setModalProjectSelectorOpen(true);
    }
  }, [isHy, isComponentLoading, project]);

  useEffect(() => {
    //useEffect to call userPermissions and get the projects
    const fetchProjects = async () => {
      const response = await getUserPermissions();
      if (response?.data) {
        setProjectsBasicInfo(
          response?.data?.permissions.map((project) => ({
            ID: project.project_id,
            NAME: project.name,
            LOGO: project.logo ? project.logo : "",
            rol_id: project.rol_id,
            views_permissions: project.views_permissions,
            action_permissions: project.action_permissions,
            isSuperAdmin: project.is_super_admin
          }))
        );

        if (response?.data?.permissions?.length === 1) {
          const permission = response.data.permissions[0];
          const project = {
            ID: permission.project_id,
            NAME: permission.name,
            LOGO: permission.logo ? permission.logo : "",
            rol_id: permission.rol_id,
            views_permissions: permission.views_permissions,
            action_permissions: permission.action_permissions,
            isSuperAdmin: permission.is_super_admin
          };
          setProjectInApi(project.ID);
          setSelectedProject(project);
        }
      }
    };

    if (!projectsBasicInfo?.length && isHy) {
      fetchProjects();
    }
  }, [isHy]);

  return (
    <div className={isSideBarLarge ? "mainLarge" : "main"}>
      <Flex vertical className="containerButtons">
        <button className="logoContainer" onClick={() => setModalProjectSelectorOpen(true)}>
          {LOGO ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="logo company" src={LOGO.trim()} className="logoContainer__image" />
          ) : (
            <Avatar shape="square" className="imageWithoutImage" size={50} icon={<Clipboard />} />
          )}
        </button>
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
              className={
                path.startsWith("/logistics/contracts") ? "buttonIcon" : "buttonIconActive"
              }
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
              className={
                path.startsWith("/logistics/providers") ? "buttonIcon" : "buttonIconActive"
              }
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
                path.startsWith("/logistics/transfer-orders") ||
                path.startsWith("/logistics/orders")
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
      </Flex>
      <Flex className="exit">
        <Button
          type="text"
          size="large"
          onClick={() => logOut(router)}
          icon={<ArrowLineRight size={26} />}
          className="buttonExit"
        >
          {isSideBarLarge && "Salir"}
        </Button>
      </Flex>
      <ModalProjectSelector
        isOpen={modalProjectSelectorOpen}
        onClose={() => setModalProjectSelectorOpen(false)}
      />
    </div>
  );
};
