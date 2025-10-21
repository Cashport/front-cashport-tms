import { CarriersPricing } from "@/types/logistics/schema";

export interface CarrierForApprovalSlice {
  selectedCarriers: CarriersPricing[];
  transferRequestId: number | null;
  // eslint-disable-next-line no-unused-vars
  setSelectedCarriers: (carriers: CarriersPricing[]) => void;
  // eslint-disable-next-line no-unused-vars
  setTransferRequestId: (id: number | null) => void;
  clearCarrierForApproval: () => void;
}

export const createCarrierForApprovalSlice = (set: any): CarrierForApprovalSlice => ({
  selectedCarriers: [],
  transferRequestId: null,
  setSelectedCarriers: (carriers: CarriersPricing[]) => set({ selectedCarriers: carriers }),
  setTransferRequestId: (id: number | null) => set({ transferRequestId: id }),
  clearCarrierForApproval: () => set({ selectedCarriers: [], transferRequestId: null })
});
