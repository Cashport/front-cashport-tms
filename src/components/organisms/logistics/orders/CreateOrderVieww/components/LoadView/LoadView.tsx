import React, { useEffect, useState } from "react";
import { Control, Controller, useFieldArray, useWatch } from "react-hook-form";
import {
  Row,
  Col,
  Select,
  Table,
  Typography,
  Button,
  Popconfirm,
  Flex,
  Checkbox,
  TableProps
} from "antd";
import { CaretLeft, CaretRight, Trash } from "@phosphor-icons/react";

import { getAllMaterials } from "@/services/logistics/materials";
import MaterialTableFooter from "../../../CreateOrderView/components/MaterialTableFooter/MaterialTableFooter";

import { IMaterialStepOne } from "@/types/logistics/schema";
import { IFormCreateOrder } from "../../CreateOrderVieww";

import "./loadView.scss";
const { Text } = Typography;

interface ILoadViewProps {
  control: Control<IFormCreateOrder, any>;
}

const LoadView: React.FC<ILoadViewProps> = ({ control }) => {
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

  // Totales
  const totalVolume = selectedMaterials.reduce(
    (sum, item) => sum + (item.m3_volume || 0) * (item.quantity || 0),
    0
  );
  const totalWeight = selectedMaterials.reduce(
    (sum, item) => sum + (item.kg_weight || 0) * (item.quantity || 0),
    0
  );

  return (
    <Row style={{ marginBottom: "2rem" }} className="loadView">
      <Col span={24}>
        <Col span={12}>
          <h3 className="subTitle">Carga</h3>
        </Col>
        <Col span={24}>
          <Table
            columns={columns}
            dataSource={fields}
            pagination={false}
            footer={() => (
              <MaterialTableFooter totalVolume={totalVolume} totalWeight={totalWeight} />
            )}
            rowKey={"id"}
          />
        </Col>
      </Col>
      <Button
        className="btnagregar"
        style={{ margin: "12px 0" }}
        onClick={() => append({ quantity: 1 })}
      >
        Agregar material
      </Button>
    </Row>
  );
};

export default LoadView;
