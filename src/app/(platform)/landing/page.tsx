"use client";
import { Divider, Flex, Typography } from "antd";

const { Title } = Typography;
export default function Page() {
  return (
    <Flex align="center" vertical justify="center" style={{ height: "100%" }}>
      <Flex align="center" justify="center">
        <Flex vertical align="center" justify="space-between">
          <Title level={2}>Bienvenido</Title>
        </Flex>
      </Flex>
      <Title level={1} style={{ fontSize: "3.6rem", fontWeight: 500 }}>
        Transport Management System
      </Title>
      <div>
        <Divider style={{ color: "black" }} />
        <Title level={1} style={{ fontSize: "1.6rem", fontWeight: 500 }}>
          The leading supply chain logistics platform
        </Title>
      </div>
    </Flex>
  );
}
