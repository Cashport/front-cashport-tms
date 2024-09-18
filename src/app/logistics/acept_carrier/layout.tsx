import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Ordenes de transferencia",
  description: "Ordenes de transferencia"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ViewWrapper headerTitle="Aceptación proveedor">{children}</ViewWrapper>;
}
