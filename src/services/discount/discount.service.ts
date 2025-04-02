import { FileObject } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import { discountTypeByAnnual } from "@/components/organisms/discounts/constants/discountTypes";
import { DiscountSchema } from "@/components/organisms/discounts/create/resolvers/generalResolver";
import config from "@/config";
import {
  DiscountBasics,
  DiscountCreateResponse,
  DiscountGetOne
} from "@/types/discount/DiscountBasics";
import { DiscountContractRange } from "@/types/discount/DiscountContractRange";
import { GenericResponse, GenericResponsePage } from "@/types/global/IGlobal";
import { API } from "@/utils/api/api";

const defaultRes = {
  data: [],
  pagination: {
    totalPages: 1,
    actualPage: 1,
    rowsperpage: 0,
    totalRows: 0
  }
};

export const getAllDiscounts = async ({
  projectId,
  params
}: {
  projectId: number;
  params?: Record<string, string | number>;
}): Promise<GenericResponsePage<DiscountBasics[]>> => {
  const response: GenericResponsePage<DiscountBasics[]> = await API.get(
    `/discount/project/${projectId}`,
    {
      params
    }
  );
  return response.success ? response : { ...defaultRes, ...response };
};

export const deleteDiscount = async (ids: number[]) => {
  const res = ids.map((id) => API.delete(`/discount/${id}`));
  return Promise.all(res);
};

export const deactivateDiscount = async (id: number, status: boolean) => {
  const res = (await API.put(`/discount/change-status/${id}`, {
    status: status ? 1 : 0
  })) as GenericResponse;
  return res;
};

export const getContractsRanges = async (projectId: number) => {
  const response: GenericResponse<DiscountContractRange[]> = await API.get(
    `/discount/contract-ranges/project/${projectId}`
  );
  return response;
};

export const createDiscount = async (
  discount: DiscountSchema & { project_id: number },
  invoice?: FileObject[]
) => {
  let body: any = { ...discount };
  const invoiceFile: any = invoice?.[0]?.file;
  body.discount_type_id = discount.discount_type;
  delete body.discount_type;
  body.min_units_order = discount.min_order;
  delete body.min_order;
  body.end_date = body.end_date ? body.end_date : undefined;
  body.products_category = body.products_category?.map((x: number) => ({ idProduct: x }));
  body.client_nit = discount.client;
  const form = new FormData();
  form.append("request", JSON.stringify(body));
  if (discountTypeByAnnual.includes(Number(discount.discount_type))) {
    form.append("invoice", invoiceFile);
  }
  body = form;

  const response = await API.post<GenericResponse<DiscountCreateResponse>>(
    `/discount`,
    body,
    {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data",
      }
    }
  );
  return response;
};

export const updateDiscount = async (
  discount: DiscountSchema & { project_id: number },
  discountId: number,
  invoice?: FileObject[]
) => {
  let body: any = { ...discount };
  const invoiceFile: any = invoice?.[0]?.file;
  body.discount_type_id = discount.discount_type;
  delete body.discount_type;
  body.min_units_order = discount.min_order;
  delete body.min_order;
  body.end_date = body.end_date ? body.end_date : undefined;
  body.products_category = body.products_category?.map((x: number) => ({ idProduct: x }));
  body.client_nit = discount.client;

  const form = new FormData();
  form.append("request", JSON.stringify(body));
  if (discountTypeByAnnual.includes(Number(discount.discount_type)) && !discount.contract_archive) {
    if (!invoiceFile) throw new Error("El contrato es obligatorio");
    form.append("invoice", invoiceFile);
  }
  body = form;

  const response = await API.put<GenericResponse<DiscountGetOne>>(
    `${config.API_HOST}/discount/${discountId}`,
    body,
    {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data",
      }
    }
  );
  return response;
};

export const getDiscount = async (id: number) => {
  const response: GenericResponse<DiscountGetOne> = await API.get(`/discount/${id}`);
  if (!response.success) throw new Error(response.message);
  return response;
};
