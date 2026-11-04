import { SideBar } from "@/components/molecules/SideBar/SideBar";
import { Metadata } from "next";
import { FC, ReactNode } from "react";

export const metadata: Metadata = {
  title: "Clientes",
  description: "Clientes"
};

interface ConcilationLayoutProps {
  children?: ReactNode;
}

const ConcilationLayout: FC<ConcilationLayoutProps> = ({ children }) => {
  return (
    <div className="page">
      <SideBar />
      <div className="mainContent">{children}</div>
    </div>
  );
};

export default ConcilationLayout;
