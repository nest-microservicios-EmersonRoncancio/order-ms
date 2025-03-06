import { OrderStatus } from '@prisma/client';

export const OrderStatusArray = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.DELIVERED,
];
