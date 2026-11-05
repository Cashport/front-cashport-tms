import { Metadata } from "next";
import Wrapper from "@/components/organisms/wrapper/Wrapper";
import { ReactNode } from "react";
export const metadata: Metadata = {
  title: "Pedido confirmado",
  description: "Pedido confirmado"
};

export default function PedidoConfirmadoLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <Wrapper>{children}</Wrapper>;
}
