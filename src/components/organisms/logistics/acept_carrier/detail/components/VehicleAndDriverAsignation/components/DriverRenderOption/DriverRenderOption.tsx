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
  index: number;
  selectIndex: number;
}
const { Text } = Typography;

function DriverRenderOption({
  selectedDrivers,
  data,
  index,
  selectIndex
}: Readonly<IDriverOption>) {
  return (
    <Flex vertical key={`driver-${data.id}-${index}`}>
      {index !== 0 && <hr style={{ borderTop: "1px solid #f7f7f7", margin: "0 0 0.5rem 0" }}></hr>}
      <Flex align="center" justify="space-between" style={{ height: "1.5rem" }} gap={"1rem"}>
        <Flex>
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
    </Flex>
  );
}
export default DriverRenderOption;
