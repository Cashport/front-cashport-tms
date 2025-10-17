import { CarriersPricing } from "@/types/logistics/schema";

export interface CarrierForApprovalSlice {
  selectedCarrier: CarriersPricing | null;
  transferRequestId: number | null;
  // eslint-disable-next-line no-unused-vars
  setSelectedCarrier: (carrier: CarriersPricing | null) => void;
  // eslint-disable-next-line no-unused-vars
  setTransferRequestId: (id: number | null) => void;
  clearCarrierForApproval: () => void;
}

export const createCarrierForApprovalSlice = (set: any): CarrierForApprovalSlice => ({
  selectedCarrier: null,
  transferRequestId: null,
  setSelectedCarrier: (carrier: CarriersPricing | null) => set({ selectedCarrier: carrier }),
  setTransferRequestId: (id: number | null) => set({ transferRequestId: id }),
  clearCarrierForApproval: () => set({ selectedCarrier: null, transferRequestId: null })
});
