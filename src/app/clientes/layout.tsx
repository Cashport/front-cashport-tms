import { SideBar } from "@/components/molecules/SideBar/SideBar";
import Header from "@/components/organisms/header";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { Metadata } from "next";
import { FC, ReactNode } from "react";

export const metadata: Metadata = {
  title: "Clientes",
  description: "Clientes"
};

interface ClientsLayoutProps {
  children?: ReactNode;
}

const ClientsLayout: FC<ClientsLayoutProps> = ({ children }) => {
  return (
    <ViewWrapper headerTitle="Clientes" showNotifications>
      {children}
    </ViewWrapper>
  );
};

export default ClientsLayout;
