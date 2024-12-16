import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seguimiento mapa",
  description: "Seguimiento mapa"
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
