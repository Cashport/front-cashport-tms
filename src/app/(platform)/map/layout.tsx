import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seguimiento mapa",
  description: "Seguimiento mapa"
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ViewWrapper headerTitle="Dashboard">{children}</ViewWrapper>;
}
