import React from "react";
import { Tooltip } from "antd";
import { Users } from "phosphor-react";

interface CommunityIconProps {
  communityName?: string;
  withTooltip?: boolean;
  iconColor?: string;
  backgroundColor?: string;
  iconSize?: number;
}

const CommunityIcon: React.FC<CommunityIconProps> = ({
  communityName,
  withTooltip = true,
  iconColor = "#F62A2A",
  backgroundColor = "#F62A2A26",
  iconSize = 26
}) => {
  const tooltipTitle = communityName ? `Comunidad: ${communityName}` : "Comunidad";
  const content = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 8,
        borderRadius: 4,
        background: backgroundColor,
        cursor: "pointer"
      }}
    >
      <Users color={iconColor} size={iconSize} />
    </div>
  );

  return withTooltip ? <Tooltip title={tooltipTitle}>{content}</Tooltip> : content;
};

export default CommunityIcon;
