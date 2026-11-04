import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Viajes",
  description: "Viajes"
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
