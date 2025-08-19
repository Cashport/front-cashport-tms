import React, { useEffect, useState, useMemo } from "react";
import { Control, Controller, useFieldArray, useWatch } from "react-hook-form";
import { Select, Table, Button, Popconfirm, Flex, TableProps, Slider, ConfigProvider } from "antd";
import { CaretLeft, CaretRight, Plus, Trash, Truck } from "@phosphor-icons/react";

import { useDebounce } from "@/hooks/useSearch";
import { getSuggestedVehiclesByMaterials } from "@/services/logistics/vehicles";

import { IFormCreateOrder } from "../../../CreateOrderVieww";
import { IVehicleWithOccupation } from "@/types/logistics/schema";

interface ISuggestedVehicleSectionProps {
  control: Control<IFormCreateOrder, any>;
}

interface ISuggestedVehicleOptions extends IVehicleWithOccupation {
  usedPercentage?: number;
}

const SuggestedVehicleSection: React.FC<ISuggestedVehicleSectionProps> = ({ control }) => {
  const [vehicles, setVehicles] = useState<ISuggestedVehicleOptions[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "suggestedVehicle",
    keyName: "generatedId"
  });

  const selectedVehicles =
    useWatch({
      control,
      name: "suggestedVehicle"
    }) || [];

  const typeActive = useWatch({ control, name: "typeActive" });

  const selectedMaterials = useWatch({ control, name: "material" }) || [];
  const debouncedSelectedMaterials = useDebounce(selectedMaterials, 700);

  const selectedPeople = useWatch({ control, name: "people" }) || [];

  // Solución 1: Usar useMemo para estabilizar el objeto de request
  const requestData = useMemo(() => {
    if (
      !typeActive ||
      (typeActive !== "3" &&
        debouncedSelectedMaterials.length > 0 &&
        !debouncedSelectedMaterials[0].id)
    ) {
      console.info("No hay datos suficientes para la solicitud");
      return null;
    }

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

    return {
      serviceTypeId: Number(typeActive) ?? 0,
      ...(typeActive !== "3" ? { materials } : {}),
      ...(typeActive === "3" ? { passengers: selectedPeople.length } : {})
    };
  }, [
    typeActive,
    // Crear una clave estable basada en los datos relevantes
    JSON.stringify(
      debouncedSelectedMaterials.map((m) => ({
        id: m.id,
        quantity: m.quantity,
        kg_weight: m.kg_weight,
        mt_length: m.mt_length,
        mt_width: m.mt_width,
        mt_height: m.mt_height
      }))
    ),
    JSON.stringify(selectedPeople)
  ]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!requestData) return;

      try {
        setIsLoading(true);
        const res = await getSuggestedVehiclesByMaterials(requestData);

        // Solo actualizar si el componente sigue montado
        if (!cancelled) {
          setVehicles(res.vehiclesWithOcupation ?? []);
        }
      } catch (error) {
        console.error("Error fetching suggested vehicles:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    // Cleanup function para evitar actualizaciones en componente desmontado
    return () => {
      cancelled = true;
    };
  }, [requestData]); // Solo depende de requestData que está memoizado

  // Helper function to get occupation percentage
  const getOccupationPercentage = (vehicle?: ISuggestedVehicleOptions) => {
    if (!vehicle) return 0;

    switch (typeActive) {
      case "1":
      case "4":
        return vehicle.ocupationM3 || 0;
      case "2":
        return vehicle.ocupationKg || 0;
      case "3":
        return vehicle.ocupationPassengers || 0;
      default:
        return 0;
    }
  };

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
                loading={isLoading}
                disabled={isLoading}
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
                    // Calculate and store the occupation percentage
                    const occupationPercentage = getOccupationPercentage(found);

                    update(index, {
                      ...fields[index],
                      ...{
                        ...found,
                        aditional_info: found.aditional_info ?? undefined,
                        usedPercentage: occupationPercentage,
                        id: found.id,
                        HEEEEELP: "ASDASDASD",
                        ID: found.id
                      }
                    });
                  } else {
                    update(index, {
                      ...fields[index],
                      id: undefined,
                      description: undefined,
                      usedPercentage: 0
                    });
                  }
                }}
                options={vehicles
                  .filter(
                    (v) => !selectedVehicles.some((row, idx) => row.id === v.id && idx !== index)
                  )
                  .map((vehicle) => {
                    const percentageSlider = getOccupationPercentage(vehicle);

                    return {
                      value: vehicle.id,
                      label: (
                        <div className="vehicleOption">
                          <Flex
                            vertical
                            gap="0.5rem"
                            className="vehicleDetails left"
                            justify="space-between"
                          >
                            <strong
                              style={{
                                fontWeight: 600,
                                maxWidth: "255px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {vehicle.description}
                            </strong>
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

                              <strong style={{ fontWeight: 600 }}>{percentageSlider}%</strong>
                            </Flex>
                            <Slider value={percentageSlider} style={{ margin: 0 }} />
                          </Flex>
                        </div>
                      ),
                      title: vehicle.description
                    };
                  })}
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
      dataIndex: "usedPercentage",
      key: "usedPercentage",
      align: "center",
      render: (_: any, record: any) => {
        // Get the percentage from the stored value or calculate it
        const currentVehicle = vehicles.find((v) => v.id === record.id);
        const updatedPercentage = getOccupationPercentage(currentVehicle);

        return <p className="usedPercentage">{updatedPercentage}%</p>;
      }
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

        <Table
          columns={columns}
          dataSource={fields.map((field) => ({ ...field, key: field.id }))}
          pagination={false}
          rowKey={"id"}
          loading={isLoading}
        />

        <Button className="addButton" onClick={() => append({ quantity: 1 })}>
          Agregar
          <Plus size={16} />
        </Button>
      </Flex>
    </ConfigProvider>
  );
};

export default SuggestedVehicleSection;
