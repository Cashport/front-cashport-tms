import React from "react";
import { Flex } from "antd";

import "./selectableIconButtons.scss";

export type TripTypeOption = {
  id: "1" | "2" | "3";
  title: string;
  icon: React.ReactNode;
};

interface SelectableIconButtonsProps {
  options: TripTypeOption[];
  activeId?: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (id: "1" | "2" | "3") => void;
  className?: string;
  disabled?: boolean;
  allInactive?: boolean; // Nuevo prop
}

const SelectableIconButtons: React.FC<SelectableIconButtonsProps> = ({
  options,
  activeId,
  onChange,
  className,
  disabled,
  allInactive = false // Valor por defecto
}) => {
  return (
    <Flex gap="1rem" className={className} style={{ flexWrap: "wrap" }}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={[
            "iconButton",
            !allInactive && activeId === option.id ? "active" : undefined
          ].join(" ")}
          onClick={() => onChange(option.id)}
          disabled={disabled}
        >
          {option.icon}
          <div className="text">{option.title}</div>
        </button>
      ))}
    </Flex>
  );
};

export default SelectableIconButtons;
