import MergeTRFetcher from "@/components/organisms/logistics/orders/transfer_request/fetchers/MergeTRFetcher";

export default function MergeTransferRequestPage({ params }: { params: { ordersId: string } }) {
  const ordersId = decodeURIComponent(params.ordersId)
    .split(",")
    .map((a) => parseInt(a));
  return <MergeTRFetcher transferOrders={ordersId} />;
}
