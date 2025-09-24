import React from "react";
import { Control, Controller, useFieldArray, UseFormTrigger, useWatch } from "react-hook-form";
import { Table, Button, Popconfirm, Flex, Checkbox, TableProps, InputNumber, Select } from "antd";
import { CaretLeft, CaretRight, Plus, Trash } from "@phosphor-icons/react";

import useScreenWidth from "@/components/hooks/useScreenWidth";

import { IMaterialStepOne } from "@/types/logistics/schema";
import { IFormCreateOrder } from "../../../CreateOrderVieww";

interface IMaterialSectionProps {
  control: Control<IFormCreateOrder, any>;
  allMaterials: IMaterialStepOne[] | undefined;
  trigger: UseFormTrigger<IFormCreateOrder>;
}

const MaterialSection: React.FC<IMaterialSectionProps> = ({ control, allMaterials, trigger }) => {
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

  const calculateVolume = (height?: number, width?: number, length?: number): number => {
    const h = height || 0;
    const w = width || 0;
    const l = length || 0;
    return h * w * l;
  };

  const formatVolume = (volume: number): string => {
    if (volume === 0) return "--";
    return `${volume.toFixed(2).replace(".", ",")} m³`;
  };

  const materialOptions = allMaterials?.map((mat) => ({
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
              options={materialOptions?.filter(
                (option) =>
                  !selectedMaterials.some((row, idx) => row.id === option.value && idx !== index)
              )}
              onChange={(value) => {
                field.onChange(value);
                // Al seleccionar, setea automáticamente todos los datos en la fila
                const found = allMaterials?.find((mat) => mat.id === value);
                if (found) {
                  update(index, {
                    ...fields[index],
                    ...found,
                    id: found.id,
                    // Calcular el volumen inicial si tiene dimensiones
                    m3_volume: calculateVolume(found.mt_height, found.mt_width, found.mt_length)
                  });

                  // Trigger validation for numeric fields after update
                  if (trigger) {
                    setTimeout(() => {
                      trigger([
                        `material.${index}.kg_weight`,
                        `material.${index}.mt_height`,
                        `material.${index}.mt_width`,
                        `material.${index}.mt_length`
                      ]);
                    }, 0);
                  }
                } else {
                  // Limpia la fila si se deselecciona
                  update(index, {
                    ...fields[index],
                    id: undefined,
                    m3_volume: 0
                  });

                  // Clear validation errors for numeric fields
                  if (trigger) {
                    setTimeout(() => {
                      trigger([
                        `material.${index}.kg_weight`,
                        `material.${index}.mt_height`,
                        `material.${index}.mt_width`,
                        `material.${index}.mt_length`
                      ]);
                    }, 0);
                  }
                }
              }}
              className="inputSelect -ellipsis"
              style={{ width: matchiWidthNameColumn }}
              popupMatchSelectWidth={false}
              popupClassName="custom-popup"
            />
          )}
        />
        // TO DO: Optimize select
        // <Controller
        //   control={control}
        //   name={`material.${index}.id`}
        //   render={({ field }) => (
        //     <SelectTooManyOptions
        //       {...field}
        //       options={materialOptions}
        //       selectedMaterials={selectedMaterials}
        //       index={index}
        //       allMaterials={allMaterials}
        //       fields={fields}
        //       update={update}
        //       calculateVolume={calculateVolume}
        //       style={{ width: matchiWidthNameColumn }}
        //     />
        //   )}
        // />
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
          rules={errorValidationNumericInput}
          render={({ field: { value, onChange, ...field }, fieldState: { error } }) => (
            <>
              <InputNumber
                {...field}
                value={value}
                onChange={(val) => {
                  // Aseguramos que siempre sea algo valido
                  const numericValue = val === null || val === undefined ? 0 : Number(val);
                  onChange(numericValue);
                }}
                min={0}
                step={0.1}
                placeholder="1"
                className="inputNumberMaterial"
                status={error ? "error" : ""}
                formatter={(value?: number | string) => {
                  if (value === null || value === undefined || value === "") {
                    return "--";
                  }
                  return `${value} Kg`;
                }}
                parser={(value) => {
                  // Extrae solo el número del string formateado
                  if (!value) return 0;
                  const parsed = value.replace(/[^\d.]/g, "");
                  return parsed === "" ? 0 : Number(parsed);
                }}
                precision={2}
              />
              {error && <ErrorText message={error.message || ""} />}
            </>
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
          rules={errorValidationNumericInput}
          render={({ field: { value, onChange, ...field }, fieldState: { error } }) => (
            <>
              <InputNumber
                {...field}
                value={value}
                onChange={(val) => {
                  // Aseguramos que siempre sea algo valido
                  const numericValue = val === null || val === undefined ? 0 : Number(val);
                  onChange(numericValue);

                  // Actualizar el volumen cuando cambia el alto
                  const currentRow = selectedMaterials[index];
                  if (currentRow) {
                    const newVolume = calculateVolume(
                      numericValue,
                      currentRow.mt_width,
                      currentRow.mt_length
                    );
                    update(index, {
                      ...currentRow,
                      mt_height: numericValue,
                      m3_volume: newVolume
                    });
                  }
                }}
                min={0}
                step={0.01}
                placeholder="0"
                className="inputNumberMaterial"
                status={error ? "error" : ""}
                formatter={(value?: number | string) => {
                  if (value === null || value === undefined || value === "") {
                    return "--";
                  }
                  return `${value} m`;
                }}
                parser={(value) => {
                  // Extrae solo el número del string formateado
                  if (!value) return 0;
                  const parsed = value.replace(/[^\d.]/g, "");
                  return parsed === "" ? 0 : Number(parsed);
                }}
                precision={2}
              />
              {error && <ErrorText message={error.message || ""} />}
            </>
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
          rules={errorValidationNumericInput}
          render={({ field: { value, onChange, ...field }, fieldState: { error } }) => (
            <>
              <InputNumber
                {...field}
                value={value}
                onChange={(val) => {
                  // Aseguramos que siempre sea algo valido
                  const numericValue = val === null || val === undefined ? 0 : Number(val);
                  onChange(numericValue);

                  // Actualizar el volumen cuando cambia el ancho
                  const currentRow = selectedMaterials[index];
                  if (currentRow) {
                    const newVolume = calculateVolume(
                      currentRow.mt_height,
                      numericValue,
                      currentRow.mt_length
                    );
                    update(index, {
                      ...currentRow,
                      mt_width: numericValue,
                      m3_volume: newVolume
                    });
                  }
                }}
                min={0}
                step={0.01}
                placeholder="0"
                className="inputNumberMaterial"
                status={error ? "error" : ""}
                formatter={(value?: number | string) => {
                  if (value === null || value === undefined || value === "") {
                    return "--";
                  }
                  return `${value} m`;
                }}
                parser={(value) => {
                  // Extrae solo el número del string formateado
                  if (!value) return 0;
                  const parsed = value.replace(/[^\d.]/g, "");
                  return parsed === "" ? 0 : Number(parsed);
                }}
                precision={2}
              />
              {error && <ErrorText message={error.message || ""} />}
            </>
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
          rules={errorValidationNumericInput}
          render={({ field: { value, onChange, ...field }, fieldState: { error } }) => (
            <>
              <InputNumber
                {...field}
                value={value}
                onChange={(val) => {
                  // Aseguramos que siempre sea algo valido
                  const numericValue = val === null || val === undefined ? 0 : Number(val);
                  onChange(numericValue);

                  // Actualizar el volumen cuando cambia el largo
                  const currentRow = selectedMaterials[index];
                  if (currentRow) {
                    const newVolume = calculateVolume(
                      currentRow.mt_height,
                      currentRow.mt_width,
                      numericValue
                    );
                    update(index, {
                      ...currentRow,
                      mt_length: numericValue,
                      m3_volume: newVolume
                    });
                  }
                }}
                min={0}
                step={0.01}
                placeholder="0"
                className="inputNumberMaterial"
                status={error ? "error" : ""}
                formatter={(value?: number | string) => {
                  if (value === null || value === undefined || value === "") {
                    return "--";
                  }
                  return `${value} m`;
                }}
                parser={(value) => {
                  // Extrae solo el número del string formateado
                  if (!value) return 0;
                  const parsed = value.replace(/[^\d.]/g, "");
                  return parsed === "" ? 0 : Number(parsed);
                }}
                precision={2}
              />
              {error && <ErrorText message={error.message || ""} />}
            </>
          )}
        />
      )
    },
    {
      title: "Volumen",
      dataIndex: "m3_volume",
      key: "m3_volume",
      render: (_: any, __: any, index: number) => {
        const height = selectedMaterials[index]?.mt_height;
        const width = selectedMaterials[index]?.mt_width;
        const length = selectedMaterials[index]?.mt_length;

        const volume = calculateVolume(height, width, length);
        return <span>{formatVolume(volume)}</span>;
      }
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

const errorValidationNumericInput = {
  validate: (value: any) => {
    if (value === 0) {
      return "*No puede ser 0";
    }
    return true;
  }
};
const ErrorText: React.FC<{ message: string }> = ({ message }) => (
  <div
    style={{
      color: "#ff4d4f",
      fontSize: "10px",
      marginTop: "1px",
      textWrap: "nowrap",
      position: "absolute"
    }}
  >
    {message}
  </div>
);
