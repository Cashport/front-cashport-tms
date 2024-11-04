import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vehículos",
  description: "Vehículos"
};

export default function VehicleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
