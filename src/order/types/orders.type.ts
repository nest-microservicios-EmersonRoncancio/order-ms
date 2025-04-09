import { OrderStatus } from '@prisma/client';

export const OrderStatusArray = [
  OrderStatus.PENDING,
  OrderStatus.CANCELLED,
  OrderStatus.DELIVERED,
  OrderStatus.PAID,
];
