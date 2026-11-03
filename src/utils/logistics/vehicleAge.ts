import { Modal } from "antd";

const isAgeMessage = (text: string) => {
  const lower = text.toLowerCase();
  return lower.includes("antigüedad") || lower.includes("modelo verificado");
};

/**
 * Si el back rechazó la acción porque el vehículo incumple la antigüedad máxima del proyecto,
 * muestra una alerta que hay que cerrar (con el motivo) en vez del mensaje temporal.
 * Devuelve true cuando la mostró.
 */
export const showVehicleAgeAlert = (error: unknown): boolean => {
  const text = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  if (!text || !isAgeMessage(text)) return false;
  Modal.error({
    title: "Vehículo fuera de la antigüedad permitida",
    content: text,
    okText: "Entendido"
  });
  return true;
};
