import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Facturación",
  description: "Facturación"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ViewWrapper headerTitle="Facturación">{children}</ViewWrapper>;
}
