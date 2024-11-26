import { FC } from "react";
import styles from "./search-input.module.scss";
import { MagnifyingGlass } from "phosphor-react";
import { useSearch } from "@/context/SearchContext";

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
  const { searchQuery, setSearchQuery } = useSearch();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  return (
    <label htmlFor={id} className={`${styles.inputBox} ${className}`}>
      <MagnifyingGlass className={styles.icon} />
      <input
        type="text"
        id={id}
        name={name}
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleChange}
      />
    </label>
  );
};

export default UiSearchInput;
