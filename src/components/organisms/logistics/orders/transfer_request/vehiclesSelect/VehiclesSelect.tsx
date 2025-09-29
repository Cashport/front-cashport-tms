import { Flex, Select, Typography } from "antd";
import { Circle } from "phosphor-react";
import RadioButtonIcon from "@/components/atoms/RadioButton/RadioButton";
import { formatMoney, formatNumber } from "@/utils/utils";
import { IVehicleWithOccupation } from "@/types/logistics/schema";

const { Text } = Typography;

interface VehiclesSelectProps {
  id_journey: number;
  vehiclesSelected: string | undefined;
  selectedVehicleId: number;
  vehicles: IVehicleWithOccupation[];
  isLoadingVehicles: boolean;
  // eslint-disable-next-line no-unused-vars
  selectVehicle: (key: number) => void;
}

const VehiclesSelect: React.FC<VehiclesSelectProps> = ({
  vehiclesSelected,
  selectedVehicleId,
  vehicles,
  isLoadingVehicles,
  selectVehicle
}) => {
  const optionsVehicles = vehicles.map((item) => {
    const active = selectedVehicleId !== 0 && selectedVehicleId === item.id;
    const strlabel = (
      <Flex align="center" gap={12}>
        {active ? (
          <RadioButtonIcon size={24} weight="fill" style={{ color: "var(--green)" }} />
        ) : (
          <Circle size={24} style={{ color: "var(--dark-grey)" }} />
        )}
        <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "4px" }}>
          <Flex justify="space-between">
            <Text>
              <b>{item.description}</b>
            </Text>
            <div>{formatMoney(item.price)}</div>
          </Flex>
          <Text>
            Ocupación Volumen {formatNumber(item.m3_volume)} - Peso {formatNumber(item.kg_capacity)}
          </Text>
          <Text>
            Vehiculos {item.available || 0} | Tarifas {0}
          </Text>
        </div>
      </Flex>
    );

    return {
      value: item.description,
      label: strlabel,
      key: item.id,
      searchParam: item.description,
      disabled: item.available === 0 || item.available === undefined || item.available === null
    };
  });

  return (
    <Select
      showSearch
      placeholder="Agregar vehículo"
      style={{ width: "28%", height: "45px" }}
      optionFilterProp="searchParam"
      value={vehiclesSelected ? vehiclesSelected + " " : undefined}
      virtual={false}
      options={optionsVehicles.map((option) => ({
        value: option.value,
        key: option.key,
        label: option.label,
        searchParam: option.searchParam,
        disabled: option.disabled
      }))}
      onSelect={(_, { key }) => selectVehicle(key)}
      listHeight={510}
      dropdownStyle={{ width: "600px" }}
      loading={isLoadingVehicles}
    >
      {optionsVehicles.map((option) => (
        <Select.Option key={option.value} value={option.value}>
          {option.label}
        </Select.Option>
      ))}
    </Select>
  );
};

export default VehiclesSelect;
