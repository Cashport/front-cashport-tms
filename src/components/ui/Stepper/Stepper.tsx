import React from "react";
import { DotOutline } from "@phosphor-icons/react";

import "./stepper.scss";
import { Flex } from "antd";

interface StepperProps {
  children: React.ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
  isFilled?: boolean;
  showDivider?: boolean;

  className?: string;
  stepCircleBackgroundColor?: string;
  circlePosition?: "top" | "center";
}

export const Stepper: React.FC<StepperProps> = ({
  children,
  isFirst = false,
  isLast = false,
  isFilled = false,
  showDivider = true,
  className = "",
  stepCircleBackgroundColor,
  circlePosition = "center"
}) => {
  return (
    <>
      <div className={`stepItem ${className}`}>
        <div className="stepCircleContainer">
          <div
            className={`stepLine -${circlePosition} ${isFirst ? "first" : ""} ${isLast ? "last" : ""}`}
          />
          <DotOutline
            className={`stepCircle -${circlePosition}`}
            size={30}
            weight={isFilled ? "fill" : "regular"}
            style={stepCircleBackgroundColor ? { backgroundColor: stepCircleBackgroundColor } : {}}
          />
        </div>
        <div className="stepLabel">{children}</div>
      </div>
      <Flex style={{ width: "100%" }} align="center" gap={"1rem"}>
        {showDivider && !isLast && (
          <>
            <div className="stepper-divider" />
            <div style={{ flexGrow: 1, borderBottom: "1px solid #DDDDDD" }} />
          </>
        )}
      </Flex>
    </>
  );
};
