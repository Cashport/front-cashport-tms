import { CaretLeft } from "phosphor-react";
import { Dispatch, FC, SetStateAction, createContext, useMemo, useState } from "react";
import { WalletTab } from "@/components/organisms/Customers/WalletTab/WalletTab";
import Dashboard from "../dashboard";
import InvoiceActionsModal from "../invoice-actions-modal";
import { useClientDetails } from "../../hooks/client-details/client-details.hook";
import { Button, Flex, Spin } from "antd";
import Link from "next/link";
import UiTab from "@/components/ui/ui-tab";
import { InvoiceAction } from "../../constants/invoice-actions.constants";
import AccountingAdjustmentsTab from "../accounting-adjustments-tab";

import styles from "./client-details.module.scss";
import ContactsTab from "../contacts-tab";
import { IDataSection } from "@/types/portfolios/IPortfolios";

type ClientDetailsContextType = {
  selectedOption: InvoiceAction;
  setSelectedOption: Dispatch<SetStateAction<InvoiceAction>>;
  showInvoiceActionsModal: boolean;
  setShowInvoiceActionsModal: Dispatch<SetStateAction<boolean>>;
  portfolioData: IDataSection | undefined;
};
interface ClientDetailsProps {}
export const ClientDetailsContext = createContext<ClientDetailsContextType>(
  {} as ClientDetailsContextType
);

export const ClientDetails: FC<ClientDetailsProps> = () => {
  const { portfolioData } = useClientDetails();
  const [showInvoiceActionsModal, setShowInvoiceActionsModal] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<InvoiceAction>(InvoiceAction.GenerateAction);

  const items = [
    {
      key: "1",
      label: "Dashboard",
      children: portfolioData ? (
        <Dashboard />
      ) : (
        <Spin style={{ margin: "1rem auto", display: "block" }} />
      )
    },
    {
      key: "2",
      label: "Cartera",
      children: portfolioData ? (
        <WalletTab />
      ) : (
        <Spin style={{ margin: "1rem auto", display: "block" }} />
      )
    },
    {
      key: "3",
      label: "Ajustes contables",
      children: portfolioData ? (
        <AccountingAdjustmentsTab />
      ) : (
        <Spin style={{ margin: "1rem auto", display: "block" }} />
      )
    },
    {
      key: "4",
      label: "Contactos",
      children: <ContactsTab />
    }
  ];

  const ClientDetailObject: ClientDetailsContextType = useMemo(
    () => ({
      selectedOption,
      setSelectedOption,
      showInvoiceActionsModal,
      setShowInvoiceActionsModal,
      portfolioData
    }),
    [portfolioData, selectedOption, showInvoiceActionsModal]
  );

  return (
    <ClientDetailsContext.Provider value={ClientDetailObject}>
      <main className={styles.mainDetail}>
        <Flex vertical className={styles.containerDetailClient}>
          <Flex className={styles.stickyHeader} align="center" justify="space-between">
            <Flex className={styles.infoHeader} align="center" justify="center">
              <Link href={`/clientes/all`}>
                <Button
                  type="text"
                  size="large"
                  className={styles.buttonGoBack}
                  icon={<CaretLeft size={"1.6rem"} />}
                >
                  {portfolioData ? portfolioData?.data_wallet?.client_name : "Loading..."}
                </Button>
              </Link>
            </Flex>
          </Flex>

          <UiTab tabs={items} sticky />
        </Flex>
      </main>
      {showInvoiceActionsModal && <InvoiceActionsModal />}
    </ClientDetailsContext.Provider>
  );
};

export default ClientDetails;
