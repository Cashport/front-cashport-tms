import React from "react";

import "./badgeDocumentStatus.scss";
import { getStatusDetails } from "@/components/molecules/logistics/utils/documentStatusMap";

interface BadgeDocumentStatusProps {
  statusId: string;
}

const BadgeDocumentStatus: React.FC<BadgeDocumentStatusProps> = ({ statusId }) => {
  const { text, color, icon, backgroundColor } = getStatusDetails(statusId);

  return (
    <>
      <div
        style={{ "--color": color, "--bg-color": backgroundColor } as React.CSSProperties}
        className="badge-document-status"
      >
        {icon} {text}
      </div>
    </>
  );
};

export default BadgeDocumentStatus;
