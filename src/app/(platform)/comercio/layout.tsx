"use client";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { usePathname } from "next/navigation";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  // Si la URL contiene "/pedido", no aplicar el layout de comercio
  if (
    pathname.startsWith("/comercio/pedido") ||
    pathname.startsWith("/comercio/pedidoConfirmado")
  ) {
    return <>{children}</>;
  }
  return <ViewWrapper headerTitle="Mis pedidos">{children}</ViewWrapper>;
}
