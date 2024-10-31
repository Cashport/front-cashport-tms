"use client";
import Loader from "@/components/atoms/loaders/loader";
import { TransferOrders } from "@/components/organisms/logistics/transfer-orders/TransferOrders";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { Suspense } from "react";

function TransferOrderPage() {
  return (
    <ViewWrapper headerTitle="Ordenes de transferencia">
      <Suspense fallback={<Loader />}>
        <TransferOrders />
      </Suspense>
    </ViewWrapper>
  );
}

export default TransferOrderPage;
