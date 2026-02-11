import { OrderStatus } from "@prisma/client";

export interface ICreateOrderItem {
  productId: string;
  quantity: number;
}

export interface ICreateOrderPayload {
  customerId: string;
  items: ICreateOrderItem[];
}

export interface IOrderFilterRequest {
  searchTerm?: string;
  status?: OrderStatus;
  customerId?: string;
}
