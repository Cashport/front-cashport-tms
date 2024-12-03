import useSearch from "@/hooks/useSearch";
import { usePslFilter } from "@/hooks/useSplFilter";
import React, { createContext, ReactNode, useContext, useMemo } from "react";
interface Option {
  value: string;
  label: string;
  key: string;
  children?: Option[];
}
// Crear el contexto para el proveedor de búsqueda
interface SearchContextProps {
  searchTerm: string | undefined;
  searchQuery: string | undefined;
  handleChangeSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  filterQuery: [string, string][];
  handleUpdateFilterQuery: (updatedValues: [string, string][]) => void;
  clearFilters: () => void;
  options: Option[];
  selectedValues: string[][];
  isLoading: boolean;
  setSelectedValues: (values: string[][]) => void;
  filter: (inputValue: string, path: Option[]) => boolean;
  handleSelectAll: () => void;
  handleClearFilters: () => void;
  setSearchInput: (value: string) => void;
}
// Definir el tipo de las props del proveedor
interface SearchProviderProps {
  debounceDelay?: number; // Tiempo de debounce opcional
  children: ReactNode; // ReactNode para los elementos hijos
}
const SearchContext = createContext<SearchContextProps | undefined>(undefined);

export const SearchProvider: React.FC<SearchProviderProps> = ({
  children,
  debounceDelay = 1000 // Valor predeterminado para el debounce
}) => {
  const { searchTerm, searchQuery, handleChangeSearch } = useSearch(debounceDelay);
  const {
    options,
    selectedValues,
    isLoading,
    setSelectedValues,
    filter,
    handleSelectAll,
    handleClearFilters,
    setSearchInput,
    filterQuery,
    handleUpdateFilterQuery,
    clearFilters
  } = usePslFilter();

  const contextValue = useMemo(
    () => ({
      //SEARCH
      searchTerm,
      searchQuery,
      handleChangeSearch,
      //FILTER
      filterQuery,
      handleUpdateFilterQuery,
      clearFilters,
      options,
      selectedValues,
      isLoading,
      setSelectedValues,
      filter,
      handleSelectAll,
      handleClearFilters,
      setSearchInput
    }),
    [
      searchTerm,
      searchQuery,
      filterQuery,
      options,
      selectedValues,
      isLoading,
      setSelectedValues,
      filter,
      handleSelectAll,
      handleClearFilters,
      setSearchInput
    ]
  );

  return <SearchContext.Provider value={contextValue}>{children}</SearchContext.Provider>;
};

// Hook para usar el contexto en cualquier componente
export const useSearchContext = (): SearchContextProps => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchContext debe usarse dentro de un SearchProvider");
  }
  return context;
};
