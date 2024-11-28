import useSearch from "@/hooks/useSearch";
import React, { createContext, ReactNode, useContext, useMemo } from "react";

// Crear el contexto para el proveedor de búsqueda
interface SearchContextProps {
  searchTerm: string | undefined;
  searchQuery: string | undefined;
  handleChangeSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
// Definir el tipo de las props del proveedor
interface SearchProviderProps {
  debounceDelay?: number; // Tiempo de debounce opcional
  children: ReactNode; // ReactNode para los elementos hijos
}
const SearchContext = createContext<SearchContextProps | undefined>(undefined);

// Provider que utiliza `useSearch`
export const SearchProvider: React.FC<SearchProviderProps> = ({
  children,
  debounceDelay = 1000 // Valor predeterminado para el debounce
}) => {
  const { searchTerm, searchQuery, handleChangeSearch } = useSearch(debounceDelay);

  const contextValue = useMemo(
    () => ({
      searchTerm,
      searchQuery,
      handleChangeSearch
    }),
    [searchTerm, searchQuery, handleChangeSearch]
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
