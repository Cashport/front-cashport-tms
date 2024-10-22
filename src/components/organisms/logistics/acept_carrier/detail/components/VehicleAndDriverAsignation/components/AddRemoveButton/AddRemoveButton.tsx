// AddRemoveButton.tsx
import React from "react";
import { Pencil, PlusCircle, Trash } from "@phosphor-icons/react";
import styles from "./AddRemoveButton.module.scss";

interface AddRemoveButtonProps {
  type: "add" | "remove" | "edit";
  onClick: () => void;
  disabled?: boolean;
  text?: string;
}

const AddRemoveButton: React.FC<AddRemoveButtonProps> = ({
  type,
  onClick,
  disabled = false,
  text = "Agregar un conductor"
}) => {
  return (
    <button
      className={`${styles.buttonTransparent} ${styles.addOrRemove}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {type === "add" && <PlusCircle size={24} />} {/* Ícono de agregar */}
      {type === "remove" && <Trash size={24} />} {/* Ícono de eliminar */}
      {type === "edit" && <Pencil size={24} />} {/* Ícono de editar */}
      {type === "add" || type === "edit" ? <p>{text}</p> : <></>}
    </button>
  );
};

export default AddRemoveButton;
