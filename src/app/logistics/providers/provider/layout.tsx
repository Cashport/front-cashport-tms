import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import Container from "@/components/atoms/Container/Container";

export const metadata: Metadata = {
  title: "Nuevo Proveedor",
  description: "Carrier Info"
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ViewWrapper headerTitle="Proveedores">
      <Container>{children}</Container>
    </ViewWrapper>
  );
}
