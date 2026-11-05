"use client";

import { TransferOrderDetails } from "@/components/organisms/logistics/transfer-orders/details/Details";

function TransferOrderDetailPage({ params }: { params: { id: string } }) {
  return <TransferOrderDetails />;
}

export default TransferOrderDetailPage;