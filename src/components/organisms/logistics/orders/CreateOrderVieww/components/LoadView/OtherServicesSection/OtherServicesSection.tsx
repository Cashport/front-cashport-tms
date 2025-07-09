import React, { useEffect, useState } from "react";
import { Control, Controller, useFieldArray, useWatch } from "react-hook-form";
import { Select, Table, Button, Popconfirm, Flex, TableProps, message, ConfigProvider } from "antd";
import { CaretLeft, CaretRight, Plus, Trash } from "@phosphor-icons/react";

import { IFormCreateOrder } from "../../../CreateOrderVieww";

import { getOtherRequirements, IOtherRequirement } from "@/services/logistics/other-requirements";

interface IOtherServicesSectionProps {
  control: Control<IFormCreateOrder, any>;
}

const OtherServicesSection: React.FC<IOtherServicesSectionProps> = ({ control }) => {
  const [requirements, setRequirements] = useState<IOtherRequirement[]>([]);

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "otherServices"
  });

  const selectedServices =
    useWatch({
      control,
      name: "otherServices"
    }) || [];

  useEffect(() => {
    (async () => {
      try {
        const res = await getOtherRequirements();
        setRequirements(res.data ?? []);
      } catch (error) {
        message.error("Error al cargar opciones de otros servicios");
      }
    })();
  }, []);

  const requirementOptions = requirements.map((req) => ({
    label: req.description,
    value: req.id
  }));

  const columns: TableProps<any>["columns"] = [
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
      render: (_: any, __: any, index: number) => (
        <Controller
          control={control}
          name={`otherServices.${index}.quantity`}
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
          name={`otherServices.${index}.id`}
          render={({ field }) => (
            <Select
              {...field}
              placeholder="Seleccionar otro servicio"
              showSearch
              filterOption={(input, option) =>
                option ? option.label.toLowerCase().includes(input.toLowerCase()) : false
              }
              allowClear
              style={{ width: "100%" }}
              className="inputSelect"
              options={requirementOptions.filter(
                (option) =>
                  !selectedServices.some((row, idx) => row.id === option.value && idx !== index)
              )}
              onChange={(value) => {
                field.onChange(value);
                const found = requirements.find((req) => req.id === value);
                if (found) {
                  update(index, {
                    ...fields[index],
                    ...found,
                    id: found.id
                  });
                } else {
                  update(index, {
                    ...fields[index],
                    id: undefined
                  });
                }
              }}
            />
          )}
        />
      )
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
    <ConfigProvider
      theme={{
        components: {
          Slider: {
            railSize: 6,
            trackBg: "#CBE71E",
            trackHoverBg: "#CBE71E",
            handleColor: "#FFFFFF",
            handleActiveColor: "#CBE71E",
            handleLineWidth: 1,
            handleSize: 14,
            handleLineWidthHover: 1,
            colorBgElevated: "#CBE71E"
          }
        }
      }}
    >
      <Flex vertical gap={"1.5rem"} className="OtherServicesSection">
        <h3 className="subTitle">Otros servicios</h3>

        <Table columns={columns} dataSource={fields} pagination={false} rowKey={"id"} />

        <Button className="addButton" onClick={() => append({ quantity: 1 })}>
          Agregar
          <Plus size={16} />
        </Button>
      </Flex>
    </ConfigProvider>
  );
};

export default OtherServicesSection;
