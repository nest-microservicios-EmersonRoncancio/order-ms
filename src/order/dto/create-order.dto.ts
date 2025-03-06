import { OrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateOrderDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  totalAmount: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  totalItems: number;

  @IsEnum(OrderStatus)
  @IsOptional()
  status: OrderStatus = OrderStatus.PENDING;
}
