import { OrderStatus } from '@prisma/client';
import { IsEnum, IsString, IsUUID } from 'class-validator';

export class StatusOrderDto {
  @IsString()
  @IsUUID()
  id: string;

  @IsEnum(OrderStatus)
  status: OrderStatus;
}
