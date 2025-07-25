import RadioButtonIcon from "@/components/atoms/RadioButton/RadioButton";
import { ICarrierRequestVehicles } from "@/types/logistics/schema";
import styles from "./VehicleRenderOption.module.scss";
import { Flex, Tag, Typography } from "antd";
import { Circle } from "phosphor-react";
const { Text } = Typography;

interface IVehicleOption {
  data: ICarrierRequestVehicles;
  selectedVehicle: number | null;
  index: number;
}
function VehicleRenderOption({ data, index, selectedVehicle }: Readonly<IVehicleOption>) {
  return (
    <Flex vertical key={`vehicle-${data.id}-${index}`} style={{ width: "560px" }}>
      {index !== 0 && <hr style={{ borderTop: "1px solid #f7f7f7", margin: "0 0 0.5rem 0" }}></hr>}
      <Flex
        align="center"
        justify="space-between"
        style={{ height: "2.75rem" }}
        className="AHHHHHH"
      >
        <Flex align="center" gap={"1rem"}>
          {selectedVehicle === data.id ? <RadioButtonIcon /> : <Circle size={20} />}

          <Flex vertical>
            <p className={styles.textStrong}>{data.vehicle_type}</p>
            <Flex gap={"0.5rem"}>
              <Text ellipsis>{data.brand}</Text>
              <p color="black">•</p>
              <Text>{data.plate_number}</Text>
            </Flex>
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
          {data.status.description}
        </Tag>
      </Flex>
    </Flex>
  );
}
export default VehicleRenderOption;
