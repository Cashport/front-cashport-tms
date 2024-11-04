import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vehículo",
  description: "Vehículo"
};

export default function VehicleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
