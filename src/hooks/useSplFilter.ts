import { API } from "@/utils/api/api";
import { getAllValues, getFilteredValues } from "@/utils/logistics/useFilters";
import { DefaultOptionType } from "antd/es/select";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import useSWR from "swr";

export interface Option {
  value: string;
  label: string;
  key: string;
  disableCheckbox?: boolean;
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
  pslQuery: [string, string][];
  vpQuery: string[];
  handleUpdatePslQuery: (query: [string, string][]) => void;
  handleUpdateVpQuery: (query: string[]) => void;
  clearFilters: () => void;
  setSearchInput: Dispatch<SetStateAction<string>>;
}

export const usePslFilter = (): UsePslFilter => {
  const [selectedValues, setSelectedValues] = useState<string[][]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [pslQuery, setPslQuery] = useState<[string, string][]>([]);
  const [vpQuery, setVpQuery] = useState<string[]>([]);

  const { data: pslData, isLoading: loadingPsl } = useSWR<IPslUsers>(
    `transfer-request/home-screen-filters`,
    async (url) => API.get(url),
    {}
  );

  const { data: vpData, isLoading: loadingVp } = useSWR<{
    data: { id: number; name: string; description: string }[];
  }>("zone/all", async (url: any) => API.get(url), {});

  const transformData = (
    pslApiData: PslAPI[],
    vpApiData: { id: number; name: string; description: string }[]
  ): { options: Option[]; preSelectedValues: string[][] } => {
    const preSelectedValues: string[][] = [];

    // Transformar PSLs
    const pslOptions = pslApiData.map(({ id, description, users }) => {
      const children = users.map((user) => {
        if (user.checked) {
          preSelectedValues.push(["psls", id.toString(), user.id.toString()]);
        }
        return {
          value: user.id.toString(),
          label: user.name,
          key: `psl-${id}-user-${user.id}`
        };
      });

      return {
        value: id.toString(),
        label: description,
        key: `psl-${id}`,
        children
      };
    });

    // Transformar VPs
    const vpOptions = vpApiData.map(({ id, name, description }) => {
      return {
        value: id.toString(),
        label: `${name} - ${description}`,
        key: `vp-${id}`
      };
    });

    const options: Option[] = [
      { value: "psls", label: "PSLs", key: "psls", disableCheckbox: true, children: pslOptions },
      { value: "vps", label: "VPs", key: "vps", disableCheckbox: true, children: vpOptions }
    ];

    return { options, preSelectedValues };
  };

  const { options, preSelectedValues } = useMemo(
    () => transformData(pslData?.data || [], vpData?.data || []),
    [pslData, vpData]
  );

  useEffect(() => {
    if (JSON.stringify(selectedValues) !== JSON.stringify(preSelectedValues)) {
      setSelectedValues(preSelectedValues);
    }
  }, [preSelectedValues]);

  const clearFilters = () => {
    setPslQuery([]);
    setVpQuery([]);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSelectedValues([]);
    setPslQuery([]);
    setVpQuery([]);
  };

  const filter = (inputValue: string, path: DefaultOptionType[]) =>
    path.some((option) =>
      (option.label as string).toLowerCase().includes(inputValue.toLowerCase())
    );

  const handleSelectAll = () => {
    const filteredValues =
      searchInput.trim() !== "" ? getFilteredValues(options, searchInput) : getAllValues(options);
    setSelectedValues(filteredValues);
  };

  const handleUpdatePslQuery = (updatedValues: [string, string][]) => {
    setPslQuery(updatedValues);
  };

  const handleUpdateVpQuery = (updatedValues: string[]) => {
    setVpQuery(updatedValues);
  };
  console.log("selectedValues", selectedValues);

  type SelectedValue = string[];
  useEffect(() => {
    function separatePslsAndVps(selectedValues: SelectedValue[], options: Option[]) {
      const pslsMap = new Map<string, string>();
      const vps: string[] = [];

      selectedValues.forEach(([type, second, third]) => {
        if (type === "psls") {
          if (third) {
            // Si ya existe la clave, concatenar el nuevo valor
            pslsMap.set(second, pslsMap.has(second) ? `${pslsMap.get(second)},${third}` : third);
          } else {
            // Buscar en options
            const pslOption = options.find((opt) => opt.value === "psls");
            const childOption = pslOption?.children?.find((child) => child.value === second);
            if (childOption?.children) {
              const ids = childOption.children.map((c) => c.value).join(",");
              pslsMap.set(second, ids);
            }
          }
        } else if (type === "vps") {
          vps.push(second);
        }
      });

      const psls = Array.from(pslsMap.entries());
      return { psls, vps };
    }
    const { vps, psls } = separatePslsAndVps(selectedValues, options);
    handleUpdatePslQuery(psls);
    handleUpdateVpQuery(vps);
  }, [selectedValues]);

  return {
    options,
    isLoading: loadingPsl || loadingVp,
    handleSelectAll,
    handleClearFilters,
    filter,
    selectedValues,
    setSelectedValues,
    pslQuery,
    vpQuery,
    handleUpdatePslQuery,
    handleUpdateVpQuery,
    clearFilters,
    setSearchInput
  };
};
