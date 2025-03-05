import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern({ cmd: 'createOrder' })
  create(@Payload() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @MessagePattern({ cmd: 'findAllOrder' })
  findAll() {
    return this.orderService.findAll();
  }

  @MessagePattern({ cmd: 'findOneOrder' })
  findOne(@Payload('id') id: string) {
    console.log('id', id);
    return this.orderService.findOne(id);
  }

  @MessagePattern({ cmd: 'changeOrderStatus' })
  changeOrderStatus(@Payload() updateOrderDto: UpdateOrderDto) {
    throw new RpcException('Order not found');
  }
}
