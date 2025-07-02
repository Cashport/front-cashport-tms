import React from "react";
import { Flex } from "antd";

import "./selectableIconButtons.scss";

export type TripTypeOption = {
  id: string;
  title: string;
  icon: React.ReactNode;
};

interface SelectableIconButtonsProps {
  options: TripTypeOption[];
  activeId: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (id: string) => void;
  className?: string;
}

const SelectableIconButtons: React.FC<SelectableIconButtonsProps> = ({
  options,
  activeId,
  onChange,
  className
}) => {
  return (
    <Flex gap="1rem" className={className}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={["iconButton", activeId === option.id ? "active" : undefined].join(" ")}
          onClick={() => onChange(option.id)}
        >
          {option.icon}
          <div className="text">{option.title}</div>
        </button>
      ))}
    </Flex>
  );
};

export default SelectableIconButtons;
