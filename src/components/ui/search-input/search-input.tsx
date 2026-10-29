import { FC, useState } from "react";
import SearchField, { type SearchFieldSurface } from "@/components/ui/search-field/search-field";

interface UiSearchInputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  /** Sobre qué fondo va: tarjeta blanca (por defecto) o el gris de la página. */
  surface?: SearchFieldSurface;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Envoltorio del buscador único (DESIGN.md §8) que conserva la API anterior: avisa los
 * cambios con un evento, como un <input>, para no tocar las pantallas que ya lo usan.
 */
const UiSearchInput: FC<UiSearchInputProps> = ({
  id = "ui-search-input",
  name,
  placeholder,
  className,
  surface = "card",
  onChange
}) => {
  const [value, setValue] = useState("");

  const handleChange = (next: string) => {
    setValue(next);
    onChange?.({ target: { value: next } } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <SearchField
      id={id}
      name={name}
      placeholder={placeholder}
      surface={surface}
      value={value}
      onChange={handleChange}
      className={className}
    />
  );
};

export default UiSearchInput;
