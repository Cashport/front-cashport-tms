"use client";

import { Flex } from "antd";
import { SectionTitle } from "@/components/atoms/SectionTitle/SectionTitle";
import Wrapper from "@/components/organisms/wrapper/Wrapper";

export default function ContractsWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Wrapper>
      <Flex vertical gap={"1rem"}>
        <SectionTitle title="Contratos" />
        {children}
      </Flex>
    </Wrapper>
  );
}
