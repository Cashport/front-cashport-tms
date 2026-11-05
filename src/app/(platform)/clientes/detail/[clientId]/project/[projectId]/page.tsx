"use client";

import ClientDetails from "@/modules/clients/containers/client-details";
import { MessageProvider } from "@/context/MessageContext";

function ClientDetailPage() {
  return (
    <MessageProvider>
      <ClientDetails />
    </MessageProvider>
  );
}

export default ClientDetailPage;
