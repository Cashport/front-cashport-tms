"use client";
import Loader from "@/components/atoms/loaders/loader";
import { TransferOrders } from "@/components/organisms/logistics/transfer-orders/TransferOrders";
import { Suspense } from "react";

// TransferOrders arma su propio ViewWrapper: sus controles (buscador, Filtrar, acciones)
// dependen de su estado y van en el header (DESIGN.md §4).
function TransferOrderPage() {
  return (
    <Suspense fallback={<Loader />}>
      <TransferOrders />
    </Suspense>
  );
}

export default TransferOrderPage;
