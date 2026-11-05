"use client";

import { ProviderInfoView } from "@/components/organisms/logistics/proveedores/providerInfo/providerInfo";


function ProviderInfoPage({ params }: { params: { id: string } }) {
  return <ProviderInfoView idParam={params.id} />;
}

export default ProviderInfoPage;
