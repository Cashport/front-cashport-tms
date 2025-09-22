export interface ITicketCustomer {
  id: string;
  name: string;
  phoneNumber: string;
}

export interface ITicketAgent {
  id: string;
  name?: string;
  email?: string;
}

export interface ITicketCount {
  messages: number;
}

export interface ITicket {
  id: string;
  projectId: number;
  customerId: string;
  assignedTo: string | null;
  status: string;
  priority: string;
  subject: string;
  tags: string | null;
  metadata: any | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  customer: ITicketCustomer;
  agent: ITicketAgent | null;
  _count: ITicketCount;
}

export interface IMessage {
  id: string;
  content: string;
  type: "TEXT" | "MEDIA" | string;
  direction: "INBOUND" | "OUTBOUND";
  status: "DELIVERED" | "SENT" | "FAILED" | "READ";
  timestamp: string;
  mediaUrl: string | null;
}

interface IPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface IChatData {
  messages: IMessage[];
  pagination: IPagination;
}
