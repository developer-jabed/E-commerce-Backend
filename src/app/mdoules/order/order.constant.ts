import { OrderStatus } from "@prisma/client";

export const orderSearchableFields = [
  "customer.user.name",
  "customer.user.email",
];

export const orderFilterableFields = [
  "status",
  "customerId",
  "createdAt",
];

export const orderSortableFields = [
  "createdAt",
  "totalAmount",
];

export const orderStatusEnum = Object.values(OrderStatus);
