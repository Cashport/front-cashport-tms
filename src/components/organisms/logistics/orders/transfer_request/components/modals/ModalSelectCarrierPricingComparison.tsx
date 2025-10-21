import { useEffect, useState } from "react";
import useSWR from "swr";
import { Checkbox, Flex, message, Modal, Spin, Typography } from "antd";

import { getPricingComparisonByTransferRequestId } from "@/services/logistics/carrier-request";

import UiSearchInput from "@/components/ui/search-input";
import CarrierPriceCard from "./components/CarrierPriceCard/CarrierPriceCard";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";

import { ICarriersPricingModalComparison } from "@/types/logistics/trips/TripsSchema";

import styles from "./ModalSelectCarrierPricing.module.scss";

const { Text } = Typography;

interface CarriersPricingWithCheck extends ICarriersPricingModalComparison {
  checked?: boolean;
}
type Props = {
  open: boolean;
  onClose: () => void;
  transferRequestId: number;
  carrierRequestId: number;
};
export default function ModalSelectCarrierPricingComparison({
  open,
  onClose,
  transferRequestId,
  carrierRequestId
}: Readonly<Props>) {
  const [carriersPricing, setCarriersPricing] = useState<CarriersPricingWithCheck[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { data, isLoading, isValidating } = useSWR(
    open ? { carrierRequestId } : null,
    ({ carrierRequestId }) => getPricingComparisonByTransferRequestId([carrierRequestId]),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: true
    }
  );

  useEffect(() => {
    if (data?.pricingComparison && data.pricingComparison.length > 0) {
      // Extract all pricing and add checked property
      const allPricing: CarriersPricingWithCheck[] = data.pricingComparison.map((pricing) => ({
        ...pricing,
        checked: false
      }));
      setCarriersPricing(allPricing);
    }
  }, [data]);

  useEffect(() => {
    setSearchTerm("");
  }, [open]);

  const filteredPricing = carriersPricing.filter((pricing) => {
    const { description, fee_description, Proveedor, price } = pricing;
    return (
      (description && description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (fee_description && fee_description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (Proveedor && Proveedor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (price && price.toString().includes(searchTerm))
    );
  });

  const handleSubmitForm = async () => {
    try {
      setIsSubmitting(true);
      // TODO: Implement conversion and submission logic for pricing comparison
      // Need to adapt convertToSendCarrierRequest or create new conversion function
      message.success("Solicitudes enviadas");
      onClose();
    } catch (error) {
      if (error instanceof Error) message.error(error.message);
      else message.error("Error al enviar solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheck = (id_carrier_pricing: number, id_carrier: number, isChecked: boolean) => {
    setCarriersPricing((prev) =>
      prev.map((carrier) => {
        if (
          carrier.id_carrier_pricing === id_carrier_pricing &&
          carrier.id_carrier === id_carrier
        ) {
          return {
            ...carrier,
            checked: !isChecked
          };
        }
        return carrier;
      })
    );
  };

  const handleMasiveCheck = (newState: boolean) => {
    setCarriersPricing((prev) =>
      prev.map((carrier) => {
        if (searchTerm !== "") {
          const isFiltered = filteredPricing.some(
            (filteredCarrier) => filteredCarrier.id_carrier_pricing === carrier.id_carrier_pricing
          );
          return {
            ...carrier,
            checked: isFiltered ? newState : carrier.checked
          };
        } else {
          return {
            ...carrier,
            checked: newState
          };
        }
      })
    );
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
  };

  const allSelected = (): boolean => {
    return carriersPricing.length > 0 && carriersPricing.every((carrier) => carrier.checked);
  };

  const allSelectedInFiltered = (): boolean => {
    return filteredPricing.length > 0 && filteredPricing.every((fp) => fp.checked);
  };

  const isConfirmEnabled = () => {
    return carriersPricing.some((pricing) => pricing.checked);
  };

  const indeterminate =
    filteredPricing.filter((fp) => fp.checked).length > 0 &&
    !allSelectedInFiltered() &&
    filteredPricing.length > 0;

  const checkAll = searchTerm === "" ? allSelected() : allSelectedInFiltered();

  return (
    <Modal
      title={
        <Header
          title="Proveedores"
          description="Seleccione los proveedores para generar tarifa comparativa"
        />
      }
      open={open}
      onCancel={onClose}
      width={686}
      centered
      footer={
        <Footer
          view={""}
          handleCancel={onClose}
          handleSubmit={handleSubmitForm}
          isSubmitting={isSubmitting}
          disabledContinue={!isConfirmEnabled()}
        />
      }
    >
      {isLoading || isValidating ? (
        <Flex justify="center" align="center" style={{ minHeight: "300px" }}>
          <Spin size="large" />
        </Flex>
      ) : (
        <div className="scrollableTabGlobalCss">
          <Flex gap={20} style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
            <UiSearchInput
              className={styles.searchBar}
              placeholder="Buscar"
              onChange={handleSearchChange}
            />
          </Flex>
          <Flex vertical gap={8} className={styles.tripCarrierPricing}>
            <Checkbox
              style={{ marginLeft: "0.5rem" }}
              onChange={(e) => handleMasiveCheck(e.target.checked)}
              checked={checkAll}
              indeterminate={indeterminate}
            >
              <Text style={{ fontWeight: "500" }}>Seleccionar todos</Text>
            </Checkbox>
            {filteredPricing.length === 0 ? (
              <Flex justify="center" align="center" style={{ padding: "2rem" }}>
                <Text type="secondary">No se encontraron proveedores</Text>
              </Flex>
            ) : (
              filteredPricing.map((carrier, index) => (
                <CarrierPriceCard
                  key={`carrier-${carrier.id_carrier_pricing}-${carrier.id_carrier}-${index}`}
                  carrier={carrier as any}
                  currentTripId={carrier.id_carrier_pricing}
                  isChecked={carrier?.checked ?? false}
                  handleCheck={handleCheck}
                  type="trip"
                  journey={undefined}
                />
              ))
            )}
          </Flex>
        </div>
      )}
    </Modal>
  );
}
