export interface IPaymentLinkData {
  ticket_id: string;
  fecha_vencimiento: string;
  hora_vencimiento: string;
  amount: number;
  descripcion: string;
  email: string;
}

export interface IGeneratePaymentLinkResponse {
  id: number;
  client: string;
  amount: number;
  status: string;
  expiration: string;
  link: string;
}
