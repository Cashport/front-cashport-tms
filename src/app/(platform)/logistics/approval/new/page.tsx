"use client";
import { NewApprovalForm } from "@/modules/logistics/approval/components/NewApprovalForm/newApprovalForm";

function CreateTransferRequestPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  return <NewApprovalForm />;
}

export default CreateTransferRequestPage;
