import React, { useEffect, useState } from "react";
import { Control, Controller, useFieldArray, useWatch } from "react-hook-form";
import { Select, Table, Button, Popconfirm, Flex, TableProps } from "antd";
import { CaretLeft, CaretRight, Plus, Trash } from "@phosphor-icons/react";

import { getAllMaterials } from "@/services/logistics/materials";

import { IMaterialStepOne } from "@/types/logistics/schema";
import { IFormCreateOrder } from "../../../CreateOrderVieww";

interface ISuggestedVehicleSectionProps {
  control: Control<IFormCreateOrder, any>;
}

const SuggestedVehicleSection: React.FC<ISuggestedVehicleSectionProps> = ({ control }) => {
  const [allMaterials, setAllMaterials] = useState<IMaterialStepOne[]>([]);

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
      const res = await getAllMaterials();
      setAllMaterials(res.data ?? []);
    })();
  }, []);

  const materialOptions = allMaterials.map((mat) => ({
    label: mat.description,
    value: mat.id
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
            <Flex align="center">
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
      )
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
              placeholder="Selecciona material"
              showSearch
              filterOption={(input, option) =>
                option ? option.label.toLowerCase().includes(input.toLowerCase()) : false
              }
              allowClear
              options={materialOptions.filter(
                (option) =>
                  !selectedMaterials.some((row, idx) => row.id === option.value && idx !== index)
              )}
              onChange={(value) => {
                field.onChange(value);
                // Al seleccionar, setea automáticamente todos los datos en la fila
                const found = allMaterials.find((mat) => mat.id === value);
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
              style={{ width: 220 }}
            />
          )}
        />
      )
    },
    {
      title: "Tasa de utilización",
      dataIndex: "used_percentage",
      key: "used_percentage"
      // render: (_: any, __: any, index: number) => (fields[index]?.used_percentage ?? "-") + " %"
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
