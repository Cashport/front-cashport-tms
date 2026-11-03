import { Modal } from "antd";

const isVetoMessage = (text: string) => text.toLowerCase().includes("vetado");

/**
 * Si el back rechazó la acción por un conductor vetado, muestra una alerta que hay que cerrar
 * (con el motivo) en vez del mensaje temporal. Devuelve true cuando la mostró.
 */
export const showDriverVetoAlert = (error: unknown): boolean => {
  const text = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  if (!text || !isVetoMessage(text)) return false;
  Modal.error({
    title: "Conductor vetado",
    content: text,
    okText: "Entendido"
  });
  return true;
};
