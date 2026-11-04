import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Detalle de Solicitud de Transferencia",
  description: "Detalle de Solicitud de Transferencia"
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ViewWrapper headerTitle="Resumen del viaje">{children}</ViewWrapper>;
}
