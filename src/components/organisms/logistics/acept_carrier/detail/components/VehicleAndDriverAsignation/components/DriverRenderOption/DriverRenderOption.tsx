import RadioButtonIcon from "@/components/atoms/RadioButton/RadioButton";
import { ICarrierRequestDrivers } from "@/types/logistics/schema";
import { Flex, Tag, Typography } from "antd";
import { Circle } from "phosphor-react";

import styles from "./DriverRenderOption.module.scss";

interface IDriverOption {
  selectedDrivers: {
    driverId: number | null;
  }[];
  data: ICarrierRequestDrivers;
  selectIndex: number;
}
const { Text } = Typography;

function DriverRenderOption({ selectedDrivers, data, selectIndex }: Readonly<IDriverOption>) {
  return (
    <Flex align="center" justify="space-between" style={{ height: "2.5rem" }} gap={"1rem"}>
      <Flex align="center" gap={"1rem"}>
        {selectedDrivers[selectIndex].driverId == data.id ? (
          <RadioButtonIcon />
        ) : (
          <Circle size={20} />
        )}
        <Flex gap={4}>
          <Text ellipsis>
            {data.name} {data.last_name}
          </Text>
          <p color="black">•</p>
          <Text>{data.phone}</Text>
        </Flex>
      </Flex>
      <Tag
        icon={<Circle color={data.status.color} weight="fill" size={6} />}
        style={{
          backgroundColor: data.status.backgroundColor || " #F7F7F7",
          color: data.status.color
        }}
        className={styles.tag}
      >
        {data.status.description || data.status.name}
      </Tag>
    </Flex>
  );
}
export default DriverRenderOption;
