import React, { useEffect, useState } from "react";
import { Control, Controller, useFieldArray, useWatch } from "react-hook-form";
import { Select, Table, Button, Popconfirm, Flex, TableProps, message } from "antd";
import { CaretLeft, CaretRight, Plus, Trash, Truck } from "@phosphor-icons/react";

import { getSuggestedVehicles } from "@/services/logistics/vehicles";
import { IFormCreateOrder } from "../../../CreateOrderVieww";

import { ISuggestedVehicle } from "@/types/logistics/schema";

interface ISuggestedVehicleSectionProps {
  control: Control<IFormCreateOrder, any>;
}

interface ISuggestedVehicleOptions extends ISuggestedVehicle {
  usedPercentage?: number;
}

const SuggestedVehicleSection: React.FC<ISuggestedVehicleSectionProps> = ({ control }) => {
  const [vehicles, setVehicles] = useState<ISuggestedVehicleOptions[]>([]);

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "suggestedVehicle"
  });

  const selectedVehicles =
    useWatch({
      control,
      name: "suggestedVehicle"
    }) || [];

  useEffect(() => {
    (async () => {
      try {
        const res = await getSuggestedVehicles();
        setVehicles(res.data ?? []);
      } catch (error) {
        message.error("Error al cargar opciones de vehículos sugeridos");
      }
    })();
  }, []);

  const columns: TableProps<any>["columns"] = [
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
      render: (_: any, __: any, index: number) => (
        <Controller
          control={control}
          name={`suggestedVehicle.${index}.quantity`}
          render={({ field }) => (
            <Flex align="center" justify="center">
              <CaretLeft
                onClick={() => field.onChange(Math.max((field.value || 1) - 1, 1))}
                style={{ cursor: "pointer" }}
              />
              &nbsp;{field.value ?? 1}&nbsp;
              <CaretRight
                onClick={() => field.onChange((field.value || 1) + 1)}
                style={{ cursor: "pointer" }}
              />
            </Flex>
          )}
        />
      ),
      align: "center",
      width: 100
    },
    {
      title: "Vehículo",
      dataIndex: "id",
      key: "id",
      render: (_: any, __: any, index: number) => (
        <Controller
          control={control}
          name={`suggestedVehicle.${index}.id`}
          render={({ field }) => {
            const selectedId = field.value;
            const selectedVehicle = vehicles.find((v) => v.id === selectedId);

            return (
              <Select
                {...field}
                labelInValue
                placeholder="Seleccionar vehículo"
                showSearch
                style={{ width: 500 }}
                allowClear
                className="inputSelect"
                value={
                  selectedVehicle
                    ? {
                        value: selectedVehicle.id,
                        label: selectedVehicle.description
                      }
                    : undefined
                }
                onChange={(option) => {
                  const found = vehicles.find((v) => v.id === option.value);
                  field.onChange(option.value);
                  if (found) {
                    update(index, {
                      ...fields[index],
                      ...found,
                      id: found.id
                    });
                  } else {
                    update(index, {
                      ...fields[index],
                      id: undefined,
                      description: undefined
                    });
                  }
                }}
                options={vehicles
                  .filter(
                    (v) => !selectedVehicles.some((row, idx) => row.id === v.id && idx !== index)
                  )
                  .map((vehicle) => ({
                    value: vehicle.id,
                    label: (
                      <div className="vehicleOption">
                        <Flex vertical gap="0.5rem" className="vehicleDetails left">
                          <strong>{vehicle.description}</strong>
                          <span>
                            Largo: {vehicle.length}m • Ancho: {vehicle.width}m • Alto:{" "}
                            {vehicle.height}m
                          </span>
                        </Flex>

                        <Flex vertical gap="0.5rem" className="vehicleDetails right">
                          <Flex>
                            <span>
                              <Truck size={16} />
                              Utilización
                            </span>

                            <strong>90%</strong>
                          </Flex>
                          <p>Aca va el sliderrrrr</p>
                        </Flex>
                      </div>
                    ),
                    title: vehicle.description
                  }))}
                optionRender={(option) => option.label}
                filterOption={(input, option) =>
                  (option?.title || "").toLowerCase().includes(input.toLowerCase())
                }
              />
            );
          }}
        />
      )
    },
    {
      title: "Tasa de utilización",
      dataIndex: "used_percentage",
      key: "used_percentage",
      align: "center",
      render: () => <p className="usedPercentage">0%</p>
    },
    {
      title: "",
      key: "action",
      render: (_: any, __: any, index: number) => (
        <Popconfirm title="¿Seguro de eliminar?" onConfirm={() => remove(index)}>
          <Button type="link" danger icon={<Trash size={20} />} />
        </Popconfirm>
      ),
      width: 60
    }
  ];

  return (
    <Flex vertical gap={"1.5rem"} className="suggestedVehicleSection">
      <h3 className="subTitle">Vehículo sugerido</h3>

      <Table columns={columns} dataSource={fields} pagination={false} rowKey={"id"} />

      <Button className="addButton" onClick={() => append({ quantity: 1 })}>
        Agregar
        <Plus size={16} />
      </Button>
    </Flex>
  );
};

export default SuggestedVehicleSection;
