"use client";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { usePathname } from "next/navigation";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  // Obtener las partes del pathname, por ejemplo: ["", "logistics", "orders", "details", "70"]
  const pathParts = pathname.split("/");

  // Condicionar el título basado en la existencia de un ID en la URL
  const headerTitle = pathParts.length === 4 ? "Ordenes" : "Resumen de viaje";
  return <ViewWrapper headerTitle={headerTitle}>{children}</ViewWrapper>;
}
