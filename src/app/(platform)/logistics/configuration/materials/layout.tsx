import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proveedores",
  description: "Proveedores"
};

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
