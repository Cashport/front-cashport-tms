import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Tarifas",
  description: "Gestión de tarifas"
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ViewWrapper headerTitle="Tarifas">{children}</ViewWrapper>;
} 