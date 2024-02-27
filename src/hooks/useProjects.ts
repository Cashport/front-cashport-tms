import useSWR from "swr";

import { IProjects } from "@/types/projects/IProjects";
import { fetcher } from "@/utils/api/api";

interface Props {
  page?: number;
  countryId: string[];
  currencyId: string[];
}

export const useProjects = ({ page, countryId, currencyId }: Props) => {
  const pathKey = `/project?page=${page}${countryId.length > 0 ? `&country_id=${countryId.join(",")}` : ""}${currencyId.length > 0 ? `${`&currency_id=${currencyId.join(",")}`}` : ""}`;
  const { data, error } = useSWR<IProjects>(pathKey, fetcher, {});
  return {
    data: data || ([] as any),
    loading: !error && !data
  };
};
