import { FC } from "react";
import { useSearchContext } from "@/context/SearchContext";
import SearchField, { type SearchFieldSurface } from "@/components/ui/search-field/search-field";

interface UiSearchInputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  /** Sobre qué fondo va: tarjeta blanca (por defecto) o el gris de la página (header). */
  surface?: SearchFieldSurface;
}

/** Buscador único (DESIGN.md §8) conectado al SearchContext. */
const UiSearchInput: FC<UiSearchInputProps> = ({
  id = "ui-search-input",
  name,
  placeholder,
  className,
  surface = "card"
}) => {
  const { searchTerm, handleChangeSearch } = useSearchContext();

  return (
    <SearchField
      id={id}
      name={name}
      placeholder={placeholder}
      surface={surface}
      value={searchTerm ?? ""}
      onChange={(value) =>
        handleChangeSearch({ target: { value } } as React.ChangeEvent<HTMLInputElement>)
      }
      className={className}
    />
  );
};

export default UiSearchInput;
