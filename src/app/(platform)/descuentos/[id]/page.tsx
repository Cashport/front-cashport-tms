import { CreateDiscountView } from "@/components/organisms/discounts/create/CreateDiscountView";

export default function Create({ params }: { params: { id: string } }) {
  return <CreateDiscountView params={params} />;
}
