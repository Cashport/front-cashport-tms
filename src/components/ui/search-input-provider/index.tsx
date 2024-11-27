import { FC } from "react";
import styles from "./search-input.module.scss";
import { MagnifyingGlass, XCircle } from "phosphor-react";
import { useSearchContext } from "@/context/SearchContext";

interface UiSearchInputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
}

const UiSearchInput: FC<UiSearchInputProps> = ({
  id = "ui-search-input",
  name,
  placeholder,
  className
}) => {
  const { searchTerm, handleChangeSearch } = useSearchContext();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleChangeSearch(event);
  };
  const handleClear = () => {
    // Crear un evento falso para resetear el searchTerm
    const fakeEvent = { target: { value: "" } } as React.ChangeEvent<HTMLInputElement>;
    handleChangeSearch(fakeEvent);
  };

  return (
    <label htmlFor={id} className={`${styles.inputBox} ${className}`}>
      <MagnifyingGlass className={styles.icon} />
      <input
        type="text"
        id={id}
        name={name}
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleChange}
      />
      {searchTerm && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClear}
          aria-label="Clear search"
        >
          <XCircle className={styles.clearIcon} />
        </button>
      )}
    </label>
  );
};

export default UiSearchInput;
