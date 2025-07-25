import { ICarrierRequestVehicles } from "@/types/logistics/schema";
import { Flex, Typography } from "antd";
import { DefaultOptionType } from "antd/es/select";

const { Text } = Typography;

interface IVehicleLabel {
  vehicles: ICarrierRequestVehicles[] | null | undefined;
  selectedValue: DefaultOptionType;
}

function VehicleRenderLabel({ vehicles, selectedValue }: IVehicleLabel) {
  const selectedVehicle = vehicles?.find((vehicle) => vehicle.id === selectedValue.value);
  return (
    selectedVehicle && (
      <Flex gap={8} align="center">
        <Flex flex={3} gap={8} style={{ minWidth: "0" }}>
          <Text ellipsis strong>
            {selectedVehicle.vehicle_type}
          </Text>
          <Text>•</Text>
          <Text
            ellipsis
            strong
          >{`${selectedVehicle.brand} ${selectedVehicle.line} ${selectedVehicle.color}`}</Text>
        </Flex>
        <Flex flex={1} justify="flex-end" style={{ minWidth: "0" }}>
          <Text strong style={{ marginRight: "1.5rem" }}>
            {selectedVehicle.plate_number}
          </Text>
        </Flex>
      </Flex>
    )
  );
}
export default VehicleRenderLabel;
