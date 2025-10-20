"use Client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import ModalSelectCarrierPricing from "@/components/organisms/logistics/orders/transfer_request/components/modals/ModalSelectCarrierPricing";
import { ITransferRequestJourneyReview } from "@/types/logistics/schema";

type ModalType = "carrier_pricing_request" | null;

type ModalSelectCarrierPricingProps = {
  transferRequestId: number;
  view?: string;
  mutateStepthree?: (journey: ITransferRequestJourneyReview[]) => void;
  setView?: React.Dispatch<React.SetStateAction<"solicitation" | "vehicles" | "carrier">>;
  extractCreatedCarriers?: (data: { journey: ITransferRequestJourneyReview[] }) => void;
};

type ModalProps = ModalSelectCarrierPricingProps;

interface ModalContextType {
  openModal: (type: ModalType, props: ModalProps) => void;
  closeModal: () => void;
  modalType: ModalType;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalProps, setModalProps] = useState<ModalProps | null>(null);

  const openModal = (type: ModalType, props: ModalProps) => {
    setModalType(type);
    setModalProps(props);
  };

  const closeModal = () => {
    setModalType(null);
    setModalProps(null);
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal, modalType }}>
      {children}
      {modalType === "carrier_pricing_request" && modalProps && (
        <ModalSelectCarrierPricing
          open={true}
          onClose={closeModal}
          {...(modalProps as ModalSelectCarrierPricingProps)}
        />
      )}
    </ModalContext.Provider>
  );
};

export const useModalDetail = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
