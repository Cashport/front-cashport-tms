"use client";
import { FC, ReactNode, useState } from "react";
import { CaretLeft } from "phosphor-react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./header.module.scss";
import UserMenu from "./user-menu/user-menu";
import { PopoverUserNotifications } from "@/components/molecules/Popover/PopoverUserNotifications/PopoverUserNotifications";

interface HeaderProps {
  title: string;
  /** Al lado del título, en la misma línea (estado del registro, "● Actualizado…"). */
  titleExtra?: ReactNode;
  /** Controles a la izquierda del avatar, en el orden de DESIGN.md §4: chips, Filtrar, buscador, ⋯, acción primaria. */
  actionsExtra?: ReactNode;
  /**
   * Muestra "‹" antes del título (pantallas de detalle). Vuelve en el historial; si se entró
   * por URL directa va a esta ruta (string) o al segmento padre de la URL actual (true).
   */
  back?: boolean | string;
  showNotifications?: boolean;
  className?: string;
}

const Header: FC<HeaderProps> = ({
  title,
  titleExtra,
  actionsExtra,
  back,
  showNotifications = false,
  className
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(
      typeof back === "string" ? back : pathname.split("/").slice(0, -1).join("/") || "/"
    );
  };

  return (
    <header className={`${styles.wrapper} ${className ?? ""}`}>
      {back && (
        <button type="button" className={styles.back} onClick={handleBack} title="Volver">
          <CaretLeft size={21} weight="bold" />
        </button>
      )}
      <div className={styles.titleBlock}>
        <h1 className={styles.title}>{title}</h1>
        {titleExtra && <div className={styles.meta}>{titleExtra}</div>}
      </div>
      {/* cp-on-page: los controles del header van sobre el gris (Filtrar, buscador → blancos). */}
      <div className={`cp-on-page ${styles.actions}`}>
        {actionsExtra}
        {showNotifications && (
          <PopoverUserNotifications
            setIsPopoverVisible={setIsNotificationsOpen}
            isPopoverVisible={isNotificationsOpen}
          />
        )}
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
