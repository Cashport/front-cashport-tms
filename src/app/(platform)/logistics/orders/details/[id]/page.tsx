"use client";

import { DetailsOrderView } from "@/components/organisms/logistics/orders/DetailsOrderView/DetailsOrderView";

function DetailsOrderPage({ params }: { params: { id: string } }) {
  console.log(params.id);
  return <DetailsOrderView idOrder={params.id} />;
}

export default DetailsOrderPage;