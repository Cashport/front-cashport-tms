import TaskManagerDetailView from "@/components/organisms/TaskManager/TaskManagerDetailView";

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  return <TaskManagerDetailView moduleTitle={`Aprobación tarifa ${params.id}`} />;
}
