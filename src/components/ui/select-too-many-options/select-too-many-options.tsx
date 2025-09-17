/* eslint-disable no-unused-vars */
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Select } from "antd";
import { useDebounce } from "@/hooks/useSearch";

interface MaterialOption {
  value: string | number;
  label: string;
}

interface SelectTooManyOptionsProps {
  value?: string | number;
  onChange: (value: string | number | undefined) => void;
  options?: MaterialOption[];
  selectedMaterials?: any[];
  index?: number;
  allMaterials?: any[];
  fields?: any[];
  update?: (index: number, data: any) => void;
  calculateVolume?: (height?: number, width?: number, length?: number) => number;
  placeholder?: string;
  maxVisible?: number;
  searchPlaceholder?: string;
  noResultsText?: string;
  className?: string;
  disabled?: boolean;
  allowClear?: boolean;
  style?: React.CSSProperties;
}

const SelectTooManyOptions = ({
  value,
  onChange,
  options = [],
  selectedMaterials = [],
  index = 0,
  allMaterials = [],
  fields = [],
  update,
  calculateVolume,
  placeholder = "Seleccionar opción",
  maxVisible = 100,
  searchPlaceholder = "Escribe para buscar",
  noResultsText = "No se encontraron resultados",
  className = "inputSelect -ellipsis",
  disabled = false,
  allowClear = true,
  style
}: SelectTooManyOptionsProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<MaterialOption[]>([]);
  const debouncedSearch = useDebounce(searchValue, 300);

  // Filter available options (exclude already selected ones)
  const availableOptions = useMemo(() => {
    return options.filter(
      (option) => !selectedMaterials.some((row, idx) => row.id === option.value && idx !== index)
    );
  }, [options, selectedMaterials, index]);

  // Apply search filter with limit
  useEffect(() => {
    let filtered = availableOptions;

    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = availableOptions.filter((option) =>
        option.label.toLowerCase().includes(searchLower)
      );
    }

    // Limit to maxVisible options for performance
    setFilteredOptions(filtered.slice(0, maxVisible));
  }, [availableOptions, debouncedSearch, maxVisible]);

  const handleChange = useCallback(
    (selectedValue: string | number | undefined) => {
      onChange(selectedValue);

      // Handle material-specific logic if props are provided
      if (update && allMaterials && fields && calculateVolume) {
        if (selectedValue) {
          const found = allMaterials.find((mat) => mat.id === selectedValue);
          if (found) {
            update(index, {
              ...fields[index],
              ...found,
              id: found.id,
              m3_volume: calculateVolume(found.mt_height, found.mt_width, found.mt_length)
            });
          }
        } else {
          update(index, {
            ...fields[index],
            id: undefined,
            m3_volume: 0
          });
        }
      }
    },
    [onChange, update, allMaterials, fields, calculateVolume, index]
  );

  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  return (
    <Select
      value={value}
      onChange={handleChange}
      showSearch
      searchValue={searchValue}
      onSearch={handleSearch}
      filterOption={false}
      allowClear={allowClear}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      style={style}
      popupMatchSelectWidth={false}
      popupClassName="custom-popup"
      notFoundContent={
        searchValue && filteredOptions.length === 0
          ? noResultsText
          : !searchValue
            ? searchPlaceholder
            : null
      }
    >
      {filteredOptions.map((option: MaterialOption) => (
        <Select.Option key={option.value} value={option.value} label={option.label}>
          {option.label}
        </Select.Option>
      ))}
      {filteredOptions.length >= maxVisible && (
        <Select.Option disabled key="more" value="more">
          -- Refina tu búsqueda para ver más opciones --
        </Select.Option>
      )}
    </Select>
  );
};

export default SelectTooManyOptions;
