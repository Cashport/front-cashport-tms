import React, { useEffect, useState } from "react";
import { Control, Controller, useFieldArray, useWatch } from "react-hook-form";
import { Select, Table, Button, Popconfirm, Flex, Checkbox, TableProps } from "antd";
import { CaretLeft, CaretRight, Plus, Trash } from "@phosphor-icons/react";

import { getAllMaterials } from "@/services/logistics/materials";

import { IMaterialStepOne } from "@/types/logistics/schema";
import { IFormCreateOrder } from "../../../CreateOrderVieww";

interface IMaterialSectionProps {
  control: Control<IFormCreateOrder, any>;
}

const MaterialSection: React.FC<IMaterialSectionProps> = ({ control }) => {
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
      title: "Nombre",
      dataIndex: "id",
      key: "id",
      render: (_: any, __: any, index: number) => (
        <Controller
          control={control}
          name={`material.${index}.id`}
          render={({ field }) => (
            <Select
              {...field}
              placeholder="Seleccionar tipo de carga"
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
                    id: undefined
                  });
                }
              }}
              style={{ width: "100%" }}
              className="inputSelect"
            />
          )}
        />
      )
    },
    {
      title: "Volumen",
      dataIndex: "m3_volume",
      key: "m3_volume",
      render: (_: any, __: any, index: number) => (fields[index]?.m3_volume ?? "-") + " m3"
    },
    {
      title: "Alto",
      dataIndex: "mt_height",
      key: "mt_height",
      render: (_: any, __: any, index: number) => (fields[index]?.mt_height ?? "-") + " m"
    },
    {
      title: "Ancho",
      dataIndex: "mt_width",
      key: "mt_width",
      render: (_: any, __: any, index: number) => (fields[index]?.mt_width ?? "-") + " m"
    },
    {
      title: "Largo",
      dataIndex: "mt_length",
      key: "mt_length",
      render: (_: any, __: any, index: number) => (fields[index]?.mt_length ?? "-") + " m"
    },
    {
      title: "Peso",
      dataIndex: "kg_weight",
      key: "kg_weight",
      render: (_: any, __: any, index: number) => (fields[index]?.kg_weight ?? "-") + " kg"
    },
    {
      title: "S. Controladas",
      dataIndex: "check",
      key: "check",
      render: () => <Checkbox />,
      align: "center"
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
    <Flex vertical gap={"1.5rem"} className="materialSection">
      <h3 className="subTitle">Material</h3>

      <Table columns={columns} dataSource={fields} pagination={false} rowKey={"id"} />

      <Button className="addButton" onClick={() => append({ quantity: 1 })}>
        Agregar
        <Plus size={16} />
      </Button>
    </Flex>
  );
};

export default MaterialSection;
