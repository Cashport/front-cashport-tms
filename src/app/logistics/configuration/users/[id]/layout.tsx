import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User",
  description: "User"
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}