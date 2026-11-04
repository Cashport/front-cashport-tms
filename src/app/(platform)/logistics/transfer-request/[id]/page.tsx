"use client";

import TrPricingSteperFetcher from "@/components/organisms/logistics/orders/transfer_request/fetchers/TrPricingSteperFetcher";


function CreateTransferRequestPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  return <TrPricingSteperFetcher id={id} />;
}

export default CreateTransferRequestPage;