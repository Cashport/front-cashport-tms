import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { Metadata } from "next";
import { ReactNode } from "react";
export const metadata: Metadata = {
  title: "Crear Pedido",
  description: "Crear Pedido"
};

export default function PedidoLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <ViewWrapper headerTitle="Crear orden">{children}</ViewWrapper>;
}
