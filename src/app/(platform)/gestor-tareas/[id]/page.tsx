import TaskManagerDetailView from "@/components/organisms/TaskManager/TaskManagerDetailView";

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const approvalId = parseInt(params.id, 10);

  return (
    <TaskManagerDetailView
      moduleTitle={`Aprobación tarifa ${approvalId}`}
      approvalId={approvalId}
    />
  );
}
