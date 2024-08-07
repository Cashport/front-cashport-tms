export interface IEcommerceClient {
  client_id: number;
  client_name: string;
}

export interface IProductData {
  category_id: number;
  category: string;
  products: IProduct[];
}

export interface IProduct {
  id: number;
  SKU: string;
  description: string;
  image: string;
  id_line: number;
  id_category: number;
  taxes: number;
  kit: number;
  locked: number;
  is_available: number;
  EAN: string;
  project_id: number;
  price: number;
  line_name: string;
  category_name: string;
}

export interface ISelectedProduct {
  id: number;
  name: string;
  price: number;
  discount: number | undefined;
  discount_percentage: number | undefined;
  quantity: number;
  image: string;
  category_id: number;
  SKU: string;
}

export interface IFetchedCategories {
  category: string;
  products: ISelectedProduct[];
}

export interface IConfirmOrderData {
  discount_id: number;
  order_summary: {
    product_sku: string;
    quantity: number;
  }[];
}

interface Product {
  product_sku: string;
  quantity: number;
  price: number;
  taxes: number;
  image: string;
}

export interface IOrderConfirmedResponse {
  discount_id: number;
  products: Product[];
  subtotal: number;
  taxes: number;
  discounts: number;
  total: number;
  total_pronto_pago: number;
}

interface IShippingInformation {
  address: string;
  city: string;
  dispatch_address: string;
  email: string;
  phone_number: string;
  comments: string;
}

export interface ICreateOrderData {
  shipping_information: IShippingInformation;
  order_summary: IOrderConfirmedResponse;
}

export interface ICommerceAdresses {
  address: string;
  city: string;
  email: string;
  id: number;
}

export interface ISingleOrder {
  id: number;
  client_id: number;
  project_id: number;
  city: string;
  contacto: string;
  total: number;
  total_pronto_pago: number;
  order_status: string;
  detail: IDetailOrder;
  shipping_info: IShippingInformation;
  created_by: number;
  order_date: string;
  created_at: string;
  updated_at: string;
  is_deleted: number;
  is_draft: number;
  client_name: string;
}

interface IDetailOrder {
  taxes: number;
  total: number;
  products: Product[];
  subtotal: number;
  discounts: number;
  discount_id: number;
  total_pronto_pago: number;
}

export interface IOrderData {
  order_status: string;
  id: number;
  order_date: string;
  city: string;
  contacto: string;
  total: number;
  total_pronto_pago: number;
  client_name: string;
}
