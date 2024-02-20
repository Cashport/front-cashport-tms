import { Dispatch, SetStateAction, useState } from "react";
import { Cascader } from "antd";
import { getAllCountries } from "@/services/countries/countries";
import { getAllCurrencies } from "@/services/currencies/currencies";

interface Option {
  value: string;
  label: string;
  disableCheckbox?: boolean;
  isLeaf?: boolean;
  children?: Option[];
}

const options: Option[] = [
  {
    value: "Pais",
    label: "Pais",
    isLeaf: false,
    disableCheckbox: true
  },
  {
    value: "Currencia",
    label: "Currencia",
    isLeaf: false,
    disableCheckbox: true
  }
];
interface Props {
  setSelecetedProjects: Dispatch<SetStateAction<{ country: number; currency: number }>>;
}
export const FilterProjects = ({ setSelecetedProjects }: Props) => {
  const [countries, setCountries] = useState<any>([]);
  const [currencies, setCurrencies] = useState<any>([]);
  const [optionsList, setOptionsList] = useState(options);
  const [selectOptions, setSelectOptions] = useState([]);
  const onBlur = () => {
    if (selectOptions.length === 0)
      return setSelecetedProjects({
        country: 0,
        currency: 0
      });
    const countriesFilters = selectOptions?.filter((item) => item[0] === "Pais")?.[0]?.[1] ?? 0;
    const currenciesFilters =
      selectOptions?.filter((item) => item[0] === "Currencia")?.[0]?.[1] ?? 0;
    setSelecetedProjects({
      country: countriesFilters,
      currency: currenciesFilters
    });
  };
  const onChange = (value: any) => {
    setSelectOptions(value);
  };

  const loadData = async (selectedOptions: any) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];

    if (targetOption.value === "Pais" && countries.length === 0) {
      const { data } = await getAllCountries();
      const countriesToShow = data.data.map((country) => ({
        label: `${country.country_name}`,
        value: `${country.id}`
      }));
      targetOption.children = countriesToShow;
      setOptionsList([...options]);
      setCountries(countriesToShow);
    }
    if (targetOption.value === "Currencia" && currencies.length === 0) {
      const { data } = await getAllCurrencies();
      const countriesToShow = data.data.map((country) => ({
        label: `${country.CURRENCY_NAME}`,
        value: `${country.ID}`
      }));
      targetOption.children = countriesToShow;
      setOptionsList([...options]);
      setCurrencies(countriesToShow);
    }
  };

  return (
    <Cascader
      style={{ width: "22rem" }}
      multiple
      size="large"
      placeholder="Filtros"
      placement="bottomRight"
      onClear={() => setSelecetedProjects({ country: 0, currency: 0 })}
      options={optionsList}
      changeOnSelect
      loadData={loadData}
      onChange={onChange}
      onBlur={onBlur}
    />
  );
};
