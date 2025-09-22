import React, { useEffect, useState } from "react";
import { Control, Controller, useFieldArray, useWatch } from "react-hook-form";
import { Select, Table, Button, Popconfirm, Flex, TableProps } from "antd";
import { Plus, Trash } from "@phosphor-icons/react";

import { IFormCreateOrder } from "../../../CreateOrderVieww";
import { getAllUsers } from "@/services/logistics/transfer-orders";
import { IGetAllPeople } from "@/types/logistics/schema";

interface IPersonalSectionProps {
  control: Control<IFormCreateOrder, any>;
}

const PersonalSection: React.FC<IPersonalSectionProps> = ({ control }) => {
  const [allPeople, setAllPeople] = useState<IGetAllPeople[]>([]);

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "people"
  });

  const selectedPeople = useWatch({
    control,
    name: "people"
  });

  useEffect(() => {
    (async () => {
      const res = await getAllUsers();
      setAllPeople(res.data ?? []);
    })();
  }, []);

  const peopleOptions = allPeople.map((mat) => ({
    label: mat.name,
    value: mat.id
  }));

  const columns: TableProps<any>["columns"] = [
    {
      title: "Nombre",
      dataIndex: "id",
      key: "id",
      width: "30%",
      render: (_: any, __: any, index: number) => (
        <Controller
          control={control}
          name={`people.${index}.id`}
          render={({ field }) => (
            <Select
              {...field}
              placeholder="Seleccionar tipo de carga"
              showSearch
              filterOption={(input, option) =>
                option ? option.label.toLowerCase().includes(input.toLowerCase()) : false
              }
              allowClear
              options={peopleOptions.filter(
                (option) =>
                  !selectedPeople?.some((row, idx) => row.id === option.value && idx !== index)
              )}
              onChange={(value) => {
                field.onChange(value);
                // Al seleccionar, setea automáticamente todos los datos en la fila
                const found = allPeople.find((mat) => mat.id === value);
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
      title: "Teléfono",
      dataIndex: "contact_number",
      key: "contact_number"
    },
    {
      title: "PSL",
      dataIndex: "psl_desc",
      key: "psl_desc"
    },
    {
      title: "CC",
      dataIndex: "cost_center_desc",
      key: "cost_center_desc"
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
    <Flex vertical gap={"1.5rem"} className="PersonalSection">
      <h3 className="subTitle">Personas</h3>

      <Table columns={columns} dataSource={fields} pagination={false} rowKey={"id"} />

      <Button className="addButton" onClick={() => append({})}>
        Agregar
        <Plus size={16} />
      </Button>
    </Flex>
  );
};

export default PersonalSection;
