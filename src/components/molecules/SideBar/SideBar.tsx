"use client";
import { useEffect, useState } from "react";
import { Avatar, Button, Flex } from "antd";

import { ArrowLineRight, Clipboard, List } from "phosphor-react";

import "./sidebar.scss";
import { usePathname, useRouter } from "next/navigation";
import { logOut } from "../../../../firebase-utils";
import { useAppStore } from "@/lib/store/store";
import useStore from "@/lib/hook/useStore";
import { getUserPermissions } from "@/services/permissions/userPermissions";
import { ModalProjectSelector } from "../modals/ModalProjectSelector/ModalProjectSelector";
import { setProjectInApi } from "@/utils/api/api";
import { ModulesButtons } from "@/components/atoms/NavigationBar/ModulesButtons/ModulesButtons";
import useScreenWidth from "@/components/hooks/useScreenWidth";

export const SideBar = () => {
  const [isSideBarLarge, setIsSideBarLarge] = useState(false);
  const width = useScreenWidth();
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
    <div className={`sidebar ${isSideBarLarge ? "mainLarge" : "main"}`}>
      {width && width <= 768 ? <List size={32} /> : null}
      <Flex vertical align="center">
        <button className="logoContainer" onClick={() => setModalProjectSelectorOpen(true)}>
          {LOGO ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="logo company" src={LOGO.trim()} className="logoContainer__image" />
          ) : (
            <Avatar shape="square" className="imageWithoutImage" size={50} icon={<Clipboard />} />
          )}
        </button>
        {width && width > 768 ? (
          <ModulesButtons isSideBarLarge={isSideBarLarge} path={path} project={project} />
        ) : null}
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
