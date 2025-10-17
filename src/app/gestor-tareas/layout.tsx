import { Metadata } from "next";
import Header from "@/components/organisms/header";
import { SideBar } from "@/components/molecules/SideBar/SideBar";

export const metadata: Metadata = {
  title: "Task manager",
  description: "Gestor de tareas",
};

export default function TaskManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page">
      <SideBar />
      <div className="mainContent">
        <Header title="Gestor de tareas" />
        {children}
      </div>
    </div>
  );
}
