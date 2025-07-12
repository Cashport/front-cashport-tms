import React, { useEffect, useState } from "react";
import { Control, Controller, useFieldArray, useWatch } from "react-hook-form";
import { Select, Table, Button, Popconfirm, Flex, Checkbox, TableProps, InputNumber } from "antd";
import { CaretLeft, CaretRight, Plus, Trash } from "@phosphor-icons/react";

import { getAllMaterials } from "@/services/logistics/materials";
import useScreenWidth from "@/components/hooks/useScreenWidth";

import { IMaterialStepOne } from "@/types/logistics/schema";
import { IFormCreateOrder } from "../../../CreateOrderVieww";

interface IMaterialSectionProps {
  control: Control<IFormCreateOrder, any>;
}

const MaterialSection: React.FC<IMaterialSectionProps> = ({ control }) => {
  const [allMaterials, setAllMaterials] = useState<IMaterialStepOne[]>([]);

  const width = useScreenWidth();

  const matchiWidthNameColumn = React.useMemo(() => {
    if (!width) return undefined;
    switch (true) {
      case width < 1350:
        return "200px";
      case width >= 1350 && width < 1400:
        return "300px";
      case width >= 1400 && width < 1480:
        return "350px";
      case width >= 1480 && width < 1600:
        return "400px";
      case width > 1600:
        return "100%";
      default:
        return undefined;
    }
  }, [width]);

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
              className="inputSelect -ellipsis"
              style={{ width: matchiWidthNameColumn }}
            />
          )}
        />
      ),
      width: matchiWidthNameColumn
    },
    {
      title: "Peso",
      dataIndex: "kg_weight",
      key: "kg_weight",
      render: (_: any, __: any, index: number) => (
        <Controller
          control={control}
          name={`material.${index}.kg_weight`}
          render={({ field }) => (
            <InputNumber
              {...field}
              min={0}
              step={0.1}
              placeholder="1"
              className="inputNumberMaterial"
              formatter={(value) => `${value ? value : "--"} Kg`}
              precision={2}
            />
          )}
        />
      )
    },
    {
      title: "Alto",
      dataIndex: "mt_height",
      key: "mt_height",
      render: (_: any, __: any, index: number) => (
        <Controller
          control={control}
          name={`material.${index}.mt_height`}
          render={({ field }) => (
            <InputNumber
              {...field}
              min={0}
              step={0.01}
              placeholder="0"
              formatter={(value) => `${value ? value : "--"} m`}
              className="inputNumberMaterial"
              precision={2}
            />
          )}
        />
      )
    },
    {
      title: "Ancho",
      dataIndex: "mt_width",
      key: "mt_width",
      render: (_: any, __: any, index: number) => (
        <Controller
          control={control}
          name={`material.${index}.mt_width`}
          render={({ field }) => (
            <InputNumber
              {...field}
              min={0}
              step={0.01}
              placeholder="0"
              formatter={(value) => `${value ? value : "--"} m`}
              className="inputNumberMaterial"
              precision={2}
            />
          )}
        />
      )
    },
    {
      title: "Largo",
      dataIndex: "mt_length",
      key: "mt_length",
      render: (_: any, __: any, index: number) => (
        <Controller
          control={control}
          name={`material.${index}.mt_length`}
          render={({ field }) => (
            <InputNumber
              {...field}
              min={0}
              step={0.01}
              placeholder="0"
              formatter={(value) => `${value ? value : "--"} m`}
              className="inputNumberMaterial"
              precision={2}
            />
          )}
        />
      )
    },
    {
      title: "Volumen",
      dataIndex: "m3_volume",
      key: "m3_volume",
      render: (volume) => <span>{volume ? `${volume} m³` : "--"}</span>
    },
    {
      title: "S. Controladas",
      dataIndex: "restriction",
      key: "restriction",
      className: "restrictionColumn",
      render: (_: any, __: any, index: number) => (
        <Controller
          control={control}
          name={`material.${index}.restriction`}
          render={({ field }) => (
            <Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
          )}
        />
      ),
      align: "center",
      width: 160
    },
    {
      title: "",
      key: "action",
      render: (_: any, __: any, index: number) => (
        <Popconfirm title="¿Seguro de eliminar?" onConfirm={() => remove(index)}>
          <Button type="link" danger icon={<Trash size={20} />} />
        </Popconfirm>
      ),
      width: 40,
      className: "actionColumn"
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
