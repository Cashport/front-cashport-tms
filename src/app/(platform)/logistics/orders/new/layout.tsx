import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Crear Nuevo Viaje ",
  description: "Crear Viaje"
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ViewWrapper headerTitle="Crear nuevo viaje">{children}</ViewWrapper>;
}
