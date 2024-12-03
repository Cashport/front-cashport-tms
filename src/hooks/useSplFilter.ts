import { fetcher } from "@/utils/api/api";
import { DefaultOptionType } from "antd/es/select";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import useSWR from "swr";

interface Option {
  value: string;
  label: string;
  key: string;
  children?: Option[];
}
interface UserAPI {
  id: number;
  email: string;
  name: string;
  checked: boolean;
}

interface PslAPI {
  id: number;
  description: string;
  checked: boolean;
  users: UserAPI[];
}

export interface IPslUsers {
  status: number;
  message: string;
  data: PslAPI[];
}

interface UsePslFilter {
  options: Option[];
  isLoading: boolean;
  handleSelectAll: () => void;
  handleClearFilters: () => void;
  filter: (inputValue: string, path: DefaultOptionType[]) => boolean;
  selectedValues: string[][];
  setSelectedValues: Dispatch<SetStateAction<string[][]>>;
  filterQuery: [string, string][];
  handleUpdateFilterQuery: (query: [string, string][]) => void;
  clearFilters: () => void;
  setSearchInput: Dispatch<SetStateAction<string>>;
}

export const usePslFilter = (): UsePslFilter => {
  const [selectedValues, setSelectedValues] = useState<string[][]>([]);
  const [searchInput, setSearchInput] = useState("");

  const [filterQuery, setFilterQuery] = useState<[string, string][]>([]);

  const { data, isLoading } = useSWR<IPslUsers>(
    `transfer-request/home-screen-filters`,
    fetcher,
    {}
  );

  function transformData(apiData: PslAPI[]): Option[] {
    return apiData.map(({ id, description, checked, users }) => ({
      value: id.toString(),
      label: description,
      key: id.toString(),
      children: users.map((user) => ({
        value: user.id.toString(),
        label: user.name,
        key: `user-${user.id}`
      }))
    }));
  }
  const transformedData = useMemo(() => transformData(data?.data ?? []), [data]);
  const clearFilters = () => {
    setFilterQuery([]);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSelectedValues([]);
    setFilterQuery([]);
  };

  // const filter = (inputValue: string, path: DefaultOptionType[]) =>
  //   path.some(
  //     (option) => (option.label as string).toLowerCase().indexOf(inputValue.toLowerCase()) > -1
  //   );
  const filter = (inputValue: string, path: DefaultOptionType[]) =>
    path.some((option) =>
      (option.label as string).toLowerCase().includes(inputValue.toLowerCase())
    );

  const getFilteredValues = (options: Option[], inputValue: string): string[][] => {
    const values: string[][] = [];

    const recurse = (options: Option[], currentPath: string[]) => {
      options.forEach((option) => {
        // Si el padre coincide, agrega solo su valor y termina la ejecución para ese nodo
        if (filter(inputValue, [option])) {
          values.push([...currentPath, option.value]);
          return;
        }

        // Si no coincide, busca en los hijos
        if (option.children) {
          recurse(option.children, [...currentPath, option.value]);
        }
      });
    };

    recurse(options, []);
    return values;
  };

  const getAllValues = (options: Option[]): string[][] => {
    const values: string[][] = [];
    options.forEach((option) => {
      values.push([option.value]);
    });
    return values;
  };
  const handleSelectAll = () => {
    const filteredValues =
      searchInput.trim() !== ""
        ? getFilteredValues(transformedData, searchInput)
        : getAllValues(transformedData);
    setSelectedValues(filteredValues);
  };

  const handleUpdateFilterQuery = (updatedValues: [string, string][]) => {
    setFilterQuery(updatedValues);
  };

  // Genera filterQuery basado en selectedValues y transformedData
  useEffect(() => {
    const updatedFilterQuery: [string, string][] = selectedValues.reduce(
      (acc, [parentValue, childValue]) => {
        const parent = transformedData.find((option) => option.value === parentValue);
        if (!parent) return acc;

        const existingParent = acc.find(([pValue]) => pValue === parentValue);
        const childIds = childValue
          ? [childValue] // Caso: Selección específica de usuario
          : parent.children?.map((child) => child.value) || []; // Caso: Selección de todos los usuarios

        if (existingParent) {
          // Si el padre ya existe en el resultado, acumula los IDs de los hijos
          existingParent[1] = [existingParent[1].split(",").concat(childIds)].join(",");
        } else {
          // Si el padre no está en el resultado, añade un nuevo registro
          acc.push([parentValue, childIds.join(",")]);
        }

        return acc;
      },
      [] as [string, string][]
    );

    handleUpdateFilterQuery(updatedFilterQuery);
  }, [selectedValues, transformedData]);

  return {
    options: transformedData,
    isLoading,
    handleSelectAll,
    handleClearFilters,
    filter,
    selectedValues,
    setSelectedValues,
    filterQuery,
    handleUpdateFilterQuery,
    clearFilters,
    setSearchInput
  };
};
