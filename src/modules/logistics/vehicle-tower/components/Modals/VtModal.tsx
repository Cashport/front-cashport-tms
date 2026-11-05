"use client";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { Modal } from "antd";
import { CaretLeft, X } from "phosphor-react";
import { paletteToCssVars } from "@/theme/mapPalette";
import type { MapThemeMode } from "@/theme/mapPalette";
import styles from "./Modals.module.scss";

export interface IVtModalProps {
  open: boolean;
  onClose: () => void;
  mode: MapThemeMode;
  title: ReactNode;
  onBack?: () => void;
  extra?: ReactNode;
  width?: number;
  children: ReactNode;
}

export function VtModal({
  open,
  onClose,
  mode,
  title,
  onBack,
  extra,
  width = 440,
  children
}: IVtModalProps) {
  // Al cambiar el contenido el foco pasa al body y antd deja de oír Escape; este oyente cubre ese caso.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      if ((e.target as HTMLElement | null)?.closest?.(".ant-modal-wrap")) return;
      onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      destroyOnClose
      width={width}
      title={null}
      style={paletteToCssVars(mode)}
      styles={{ content: { padding: 0, background: "transparent", boxShadow: "none" } }}
    >
      <div className={styles.mbox}>
        <div className={styles.mhead}>
          {onBack && (
            <button type="button" className={styles.back} onClick={onBack} aria-label="Volver">
              <CaretLeft size={16} weight="bold" />
            </button>
          )}
          <h3 className={styles.mtitle}>{title}</h3>
          {extra}
          <button type="button" className={styles.x} onClick={onClose} aria-label="Cerrar">
            <X size={15} weight="bold" />
          </button>
        </div>
        <div className={styles.mbody}>{children}</div>
      </div>
    </Modal>
  );
}
