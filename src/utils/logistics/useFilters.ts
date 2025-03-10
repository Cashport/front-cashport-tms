export interface Option {
  value: string;
  label: string;
  key: string;
  children?: Option[];
}
export const getFilteredValues = (options: Option[], searchInput: string): string[][] => {
  const filteredValues: string[][] = [];

  options.forEach((category) => {
    category.children?.forEach((child) => {
      if (child.label.toLowerCase().includes(searchInput.toLowerCase())) {
        filteredValues.push([category.value, child.value]);
      }
    });
  });

  return filteredValues;
};

export const getAllValues = (options: Option[]): string[][] => {
  const allValues: string[][] = [];

  options.forEach((category) => {
    category.children?.forEach((child) => {
      allValues.push([category.value, child.value]);
    });
  });

  return allValues;
};
