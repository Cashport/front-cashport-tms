import { MassConcilationView } from "@/components/organisms/projects/MassConcilationView/MassConcilationView";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Profitline"
};

export default function Concilation() {
  return <MassConcilationView />;
}
