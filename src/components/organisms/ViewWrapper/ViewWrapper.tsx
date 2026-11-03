import { Flex } from "antd";
import { SideBar } from "../../molecules/SideBar/SideBar";
import Header from "../header";
import styles from "./ViewWrapper.module.scss";

interface IViewWrapper {
  headerTitle: string;
  /** Al lado del título (estado del registro, "● Actualizado…"). */
  headerTitleExtra?: React.ReactNode;
  /** Acciones del header, a la izquierda del avatar (chips, Filtrar, buscador, ⋯, acción primaria). */
  headerActions?: React.ReactNode;
  /** "‹" volver en pantallas de detalle; ver `back` en Header. */
  headerBack?: boolean | string;
  showNotifications?: boolean;
  children: React.ReactNode;
  /** Espacio entre el header y el contenido. DESIGN.md §3: ninguno; el aire lo da el header. */
  gapTitle?: string;
  hideHeader?: boolean;
  /** Clase del <main>: "dark" en módulos con modo oscuro (DESIGN.md §8). */
  className?: string;
}
export default function ViewWrapper({
  headerTitle,
  headerTitleExtra,
  headerActions,
  headerBack,
  showNotifications = false,
  children,
  gapTitle = "0",
  hideHeader = false,
  className
}: Readonly<IViewWrapper>) {
  return (
    <main className={`${styles.mainWrapper} ${className ?? ""}`}>
      <SideBar />
      <Flex vertical className={styles.rightContent} gap={gapTitle}>
        {!hideHeader ? (
          <Header
            title={headerTitle}
            titleExtra={headerTitleExtra}
            actionsExtra={headerActions}
            back={headerBack}
            showNotifications={showNotifications}
          />
        ) : null}
        {children}
      </Flex>
    </main>
  );
}
