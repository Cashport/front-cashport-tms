import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Nueva aprobación",
  description: "Solicitud de transferencia"
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ViewWrapper headerTitle="Nueva aprobación">{children}</ViewWrapper>;
}
