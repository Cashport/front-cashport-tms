import { Flex } from "antd";
import "./createGeneralView.scss";
import { ContractsTable } from "@/components/molecules/tables/logistics/contractTable/contractTable";

export const CreateGeneralView = () => {
  return (
    <Flex className="contractContainer">
      <ContractsTable  />
    </Flex>
  );
};
