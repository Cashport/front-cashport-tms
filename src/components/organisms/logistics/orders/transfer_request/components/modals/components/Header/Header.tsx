import { Typography } from "antd";

const { Title, Text } = Typography;

export const Header = ({ title, description }: { title?: string; description?: string }) => (
  <>
    <Title level={4}>{title}</Title>
    <Text style={{ fontSize: "0.8rem" }}>{description}</Text>
  </>
);
