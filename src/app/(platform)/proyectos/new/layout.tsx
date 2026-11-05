import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Crear Proyecto",
  description: "Crear Proyecto"
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ViewWrapper headerTitle="Crear Proyecto">{children}</ViewWrapper>;
}
