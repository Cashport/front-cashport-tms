import { DefaultInfoConfigView } from "@/components/organisms/logistics/configuration/default/DefaultInfoConfig";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configuración",
  description: "Configuración"
};

function DefaultTableConfigPage() {
  return <DefaultInfoConfigView />;
}

export default DefaultTableConfigPage;
