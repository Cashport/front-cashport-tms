import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ubicacion",
  description: "Ubicacion"
};

export default function LocationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}