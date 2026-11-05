import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ordenes",
};
export default function OrdersLayout({children}: {children: React.ReactNode}) {
  return <>{children}</>;
}
