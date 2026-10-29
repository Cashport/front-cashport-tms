import React from "react";
import { Cascader } from "antd";
import "../filterCascader.scss";
import { useSearchContext } from "@/context/SearchContext";

const Filter: React.FC = () => {
  const {
    options,
    selectedValues,
    isLoading,
    setSelectedValues,
    filter,
    handleSelectAll,
    handleClearFilters,
    setSearchInput
  } = useSearchContext();

  return (
    <div>
      <Cascader
        multiple
        placeholder="Filtrar"
        options={options}
        value={selectedValues}
        onChange={(value: string[][]) => setSelectedValues(value)}
        onSearch={(value) => setSearchInput(value)}
        showSearch={{ filter }}
        dropdownMenuColumnStyle={{ position: "relative" }}
        dropdownRender={(menu) => (
          <div key={"dropdown"}>
            <div className="cascader-menu-container">{menu}</div>
            <div className="cascader-buttons">
              <button onClick={handleSelectAll} className="actionButton" key="selectAll">
                <p>Seleccionar Todo</p>
              </button>
              <button onClick={handleClearFilters} className="actionButton" key="clearFilters">
                <p>Borrar Filtros</p>
              </button>
            </div>
          </div>
        )}
        loading={isLoading}
        removeIcon
        // Botón Filtrar del header (DESIGN.md §4.5): sin borde, relleno blanco, 36px.
        // Pendiente: reemplazarlo por el modal Filtros Avanzados (§6).
        className="filterCascaderHeader"
        style={{ width: "170px" }}
        placement="bottomRight"
        maxTagCount="responsive"
      />
    </div>
  );
};

export default Filter;
