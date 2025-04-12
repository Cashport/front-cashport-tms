import AceptBillingDetailView from "@/components/organisms/facturacion/view/AceptBillingDetailView/AceptBillingDetailView";

export default function Page({ params }: { params: { id: string; idCarrier: string } }) {
  return <AceptBillingDetailView params={params} />;
}
      