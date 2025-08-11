import React, { useEffect, useState } from "react";
import { Control, Controller, useFieldArray, useWatch } from "react-hook-form";
import {
  Select,
  Table,
  Button,
  Popconfirm,
  Flex,
  TableProps,
  message,
  Slider,
  ConfigProvider
} from "antd";
import { CaretLeft, CaretRight, Plus, Trash, Truck } from "@phosphor-icons/react";

import { useDebounce } from "@/hooks/useSearch";
import {
  getSuggestedVehicles,
  getSuggestedVehiclesByMaterials
} from "@/services/logistics/vehicles";
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

  const typeActive = useWatch({ control, name: "typeActive" });

  const selectedMaterials = useWatch({ control, name: "material" }) || [];
  const debouncedSelectedMaterials = useDebounce(selectedMaterials, 700);

  useEffect(() => {
    (async () => {
      if (!debouncedSelectedMaterials[0].id || !typeActive) return;
      const materials = debouncedSelectedMaterials.map((material) => {
        const quantity = material.quantity ?? 1;
        const weight = material.kg_weight ?? 0;
        const length = material.mt_length ?? 0;
        const width = material.mt_width ?? 0;
        const height = material.mt_height ?? 0;

        return {
          id: material.id ?? 0,
          weight: weight * quantity,
          length: length * quantity,
          width: width * quantity,
          height: height * quantity
        };
      });

      const formattedMaterials = {
        serviceTypeId: Number(typeActive) ?? 0,
        materials
      };

      if (debouncedSelectedMaterials.length > 0) {
        const res = await getSuggestedVehiclesByMaterials(formattedMaterials);
        console.log("Suggested vehicles by materials: ", res);
      }
    })();
  }, [debouncedSelectedMaterials]);

  useEffect(() => {
    (async () => {
      const contraintTypes = ["1", "2"];
      try {
        if (contraintTypes.includes(typeActive || "")) {
          const promises = contraintTypes.map((type) => getSuggestedVehicles(type));
          const results = await Promise.all(promises);
          setVehicles(results.flatMap((res) => res.data ?? []));
        } else if (typeActive === "4") {
          const res = await getSuggestedVehicles();
          setVehicles(res.data ?? []);
        } else {
          const res = await getSuggestedVehicles(typeActive);
          setVehicles(res.data ?? []);
        }
      } catch (error) {
        message.error("Error al cargar opciones de vehículos sugeridos");
      }
    })();
  }, [typeActive]);

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
                style={{ width: 520 }}
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
                        <Flex
                          vertical
                          gap="0.5rem"
                          className="vehicleDetails left"
                          justify="space-between"
                        >
                          <strong style={{ fontWeight: 600 }}>{vehicle.description}</strong>
                          <span>
                            Largo: {vehicle.length}m • Ancho: {vehicle.width}m • Alto:{" "}
                            {vehicle.height}m
                          </span>
                        </Flex>

                        <Flex vertical gap="0.5rem" className="vehicleDetails right">
                          <Flex style={{ width: "100%" }} justify="space-between" align="center">
                            <Flex align="center" gap="4px">
                              <Truck size={16} />
                              <p>Utilización</p>
                            </Flex>

                            <strong style={{ fontWeight: 600 }}>90%</strong>
                          </Flex>
                          <Slider value={90} style={{ margin: 0 }} />
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
      <Flex vertical gap={"1.5rem"} className="suggestedVehicleSection">
        <h3 className="subTitle">Vehículo sugerido</h3>

        <Table columns={columns} dataSource={fields} pagination={false} rowKey={"id"} />

        <Button className="addButton" onClick={() => append({ quantity: 1 })}>
          Agregar
          <Plus size={16} />
        </Button>
      </Flex>
    </ConfigProvider>
  );
};

export default SuggestedVehicleSection;
