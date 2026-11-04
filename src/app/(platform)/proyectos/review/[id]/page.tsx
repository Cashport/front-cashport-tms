"use client";

import { DetailsProjectView } from "@/components/organisms/projects/DetailProjectView/DetailProjectView";
import { MessageProvider } from "@/context/MessageContext";

function ReviewProjectPage({ params }: { params: { id: string } }) {
  return (
    <MessageProvider>
      <DetailsProjectView idProjectParam={params.id} />;
    </MessageProvider>
  );
}

export default ReviewProjectPage;
