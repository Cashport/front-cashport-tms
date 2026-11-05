import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear Conductor",
  description: "Crear Conductor"
};

export default function CreateDriverLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}