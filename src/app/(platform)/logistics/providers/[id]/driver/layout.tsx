import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conductores",
  description: "Conductores"
};

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}