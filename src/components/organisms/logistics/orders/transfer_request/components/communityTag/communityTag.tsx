import React from "react";

interface CommunityTagProps {
  name: string;
}

const CommunityTag: React.FC<CommunityTagProps> = ({ name }) => {
  return (
    <span
      style={{
        backgroundColor: "#969696",
        color: "#FFFFFF",
        borderRadius: "8px",
        padding: "2px 10px",
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        height: "fit-content"
      }}
    >
      {name}
    </span>
  );
};

export default CommunityTag;
