import React, { useState } from "react";
import { Cascader, Button, Flex } from "antd";
import type { CascaderProps, GetProp } from "antd";
import "../filterCascader.scss";

type DefaultOptionType = GetProp<CascaderProps, "options">[number];
interface Option {
  value: string;
  label: string;
  disableCheckbox?: boolean;
  isLeaf?: boolean;
  children?: Option[];
}

const FilterWithCascader: React.FC = () => {
  const [selectedValues, setSelectedValues] = useState<string[][]>([]);
  console.log("selectedValues", selectedValues);
  const options: Option[] = [
    {
      value: "businessUnit",
      label: "Unidad de Negocio",
      children: [
        { value: "1", label: "Marketing" },
        { value: "2", label: "Sales" },
        { value: "3", label: "Finance" }
      ],
      disableCheckbox: true
    },
    {
      value: "zone",
      label: "Zona",
      children: [
        { value: "1", label: "Norte" },
        { value: "2", label: "Sur" },
        { value: "3", label: "Este" },
        { value: "4", label: "Oeste" }
      ],
      disableCheckbox: true
    },
    {
      value: "requestingUser",
      label: "Usuario Solicitante",
      children: [
        { value: "1", label: "Usuario A" },
        { value: "2", label: "Usuario B" },
        { value: "3", label: "Usuario C" }
      ],
      disableCheckbox: true
    }
  ];
  // Función para recorrer las opciones y obtener todas las combinaciones de valores
  const getAllValues = (options: Option[]): string[][] => {
    const values: string[][] = [];
    options.forEach((option) => {
      if (option.children) {
        option.children.forEach((child) => {
          values.push([option.value, child.value]);
        });
      } else {
        values.push([option.value]);
      }
    });
    return values;
  };

  const handleSelectAll = () => {
    const allValues = getAllValues(options);
    setSelectedValues(allValues);
  };
  const handleClearFilters = () => {
    setSelectedValues([]);
  };
  const filter = (inputValue: string, path: DefaultOptionType[]) =>
    path.some(
      (option) => (option.label as string).toLowerCase().indexOf(inputValue.toLowerCase()) > -1
    );
  return (
    <Cascader
      options={options}
      value={selectedValues}
      onChange={(value) => setSelectedValues(value)}
      placeholder="Filtrar"
      style={{ width: "120px", height: "46px" }}
      removeIcon
      placement="bottomLeft"
      maxTagCount="responsive"
      size="large"
      showSearch={{ filter }}
      multiple
      dropdownRender={(menu) => (
        <div>
          {menu}
          <button onClick={handleSelectAll} className="actionButton">
            <p>Seleccionar Todo</p>
          </button>
          <button onClick={handleClearFilters} className="actionButton">
            <p>Borrar Filtros</p>
          </button>
        </div>
      )}
    />
  );
};

export default FilterWithCascader;
