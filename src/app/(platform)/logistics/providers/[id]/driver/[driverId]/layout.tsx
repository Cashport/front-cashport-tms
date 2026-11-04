import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conductor",
  description: "Conductor"
};

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}