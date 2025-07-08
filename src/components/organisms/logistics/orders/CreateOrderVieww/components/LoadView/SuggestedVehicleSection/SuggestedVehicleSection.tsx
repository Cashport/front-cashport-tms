import React, { useEffect, useState } from "react";
import { Control, Controller, useFieldArray, useWatch } from "react-hook-form";
import { Select, Table, Button, Popconfirm, Flex, TableProps, message } from "antd";
import { CaretLeft, CaretRight, Plus, Trash } from "@phosphor-icons/react";

import { getSuggestedVehicles } from "@/services/logistics/vehicles";
import { IFormCreateOrder } from "../../../CreateOrderVieww";

import { ISuggestedVehicle } from "@/types/logistics/schema";

interface ISuggestedVehicleSectionProps {
  control: Control<IFormCreateOrder, any>;
}

const SuggestedVehicleSection: React.FC<ISuggestedVehicleSectionProps> = ({ control }) => {
  const [vehicles, setVehicles] = useState<ISuggestedVehicle[]>([]);

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "material"
  });

  const selectedMaterials =
    useWatch({
      control,
      name: "material"
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

  const vehiclesOptions = vehicles.map((vehicle) => ({
    label: vehicle.description,
    value: vehicle.id
  }));

  const columns: TableProps<any>["columns"] = [
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
      render: (_: any, __: any, index: number) => (
        <Controller
          control={control}
          name={`material.${index}.quantity`}
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
          name={`material.${index}.id`}
          render={({ field }) => (
            <Select
              {...field}
              placeholder="Seleccionar vehículo"
              showSearch
              filterOption={(input, option) =>
                option ? option.label.toLowerCase().includes(input.toLowerCase()) : false
              }
              allowClear
              options={vehiclesOptions.filter(
                (option) =>
                  !selectedMaterials.some((row, idx) => row.id === option.value && idx !== index)
              )}
              onChange={(value) => {
                field.onChange(value);
                // Al seleccionar, setea automáticamente todos los datos en la fila
                const found = vehicles.find((vehicle) => vehicle.id === value);
                if (found) {
                  update(index, {
                    ...fields[index],
                    ...found,
                    id: found.id
                  });
                } else {
                  // Limpia la fila si se deselecciona
                  update(index, {
                    ...fields[index],
                    id: undefined,
                    code_sku: undefined,
                    description: undefined,
                    m3_volume: undefined,
                    mt_height: undefined,
                    mt_width: undefined,
                    mt_length: undefined,
                    kg_weight: undefined
                  });
                }
              }}
              style={{ width: 450 }}
            />
          )}
        />
      )
    },
    {
      title: "Tasa de utilización",
      dataIndex: "used_percentage",
      key: "used_percentage",
      align: "center",
      render: () => <span>0%</span>
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
