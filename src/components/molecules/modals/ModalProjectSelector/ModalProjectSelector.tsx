import { Avatar, Modal } from "antd";
import { Clipboard } from "phosphor-react";
import { usePathname } from "next/navigation";

import { useAppStore } from "@/lib/store/store";
import { ISelectedProject } from "@/lib/slices/createProjectSlice";

import "./modalProjectSelector.scss";
interface Props {
  isOpen: boolean;
  onClose: () => void;
}
export const ModalProjectSelector = ({ isOpen, onClose }: Props) => {
  const path = usePathname();
  const selectedProject = useAppStore((state) => state.selectedProject);
  const setSelectedProject = useAppStore((state) => state.setSelectedProject);
  const clearCarrierForApproval = useAppStore((state) => state.clearCarrierForApproval);
  const projects = useAppStore((state) => state.projectsBasicInfo);

  const handleSelectProject = (project: ISelectedProject) => {
    if (project.ID === selectedProject?.ID) {
      onClose();
      return;
    }

    const projectInfo: ISelectedProject = {
      ID: project.ID,
      NAME: project.NAME,
      LOGO: project.LOGO,
      rol_id: project.rol_id,
      views_permissions: project.views_permissions,
      action_permissions: project.action_permissions,
      isSuperAdmin: project.isSuperAdmin
    };
    setSelectedProject(projectInfo);
    // Datos en memoria ligados al proyecto anterior (cotización en curso)
    clearCarrierForApproval();
    onClose();

    // Las consultas (SWR y useEffect) no dependen del proyecto: sin recargar,
    // la vista se queda con los datos del proyecto anterior. El store ya quedó
    // persistido en localStorage, así que la recarga arranca con el nuevo.
    const target = path.startsWith("/proyectos/review")
      ? `/proyectos/review/${project.ID}`
      : `${window.location.pathname}${window.location.search}`;
    window.location.assign(target);
  };

  if (projects?.length > 1) {
    return (
      <Modal
        className="modalProjectSelector"
        open={isOpen}
        onCancel={onClose}
        footer={false}
        width={"60%"}
      >
        <h2 className="modalProjectSelector__title">Elegir proyecto</h2>
        <div className="modalProjectSelector__projects">
          {projects?.map((project) => (
            <div onClick={() => handleSelectProject(project)} className="project" key={project.ID}>
              {project.LOGO ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="project__image" src={project.LOGO} alt="Project image" />
              ) : (
                <Avatar
                  shape="square"
                  className="imageWithoutImage"
                  size={65}
                  icon={<Clipboard />}
                />
              )}

              <div className={`project__name ${project.ID === selectedProject.ID && "-selected"}`}>
                <p>{project.NAME}</p>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    );
  }
  return null;
};
