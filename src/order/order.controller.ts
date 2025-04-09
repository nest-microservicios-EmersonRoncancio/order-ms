import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { StatusOrderDto } from './dto/status-order.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaymentSuccessDto } from './dto/payment-success.dto';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern({ cmd: 'createOrder' })
  async create(@Payload() createOrderDto: CreateOrderDto) {
    const order = await this.orderService.create(createOrderDto);
    const session = await this.orderService.createPaymentSession(order);

    return {
      order,
      session,
    };
  }

  @MessagePattern({ cmd: 'findAllOrder' })
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.orderService.findAll(paginationDto);
  }

  @MessagePattern({ cmd: 'findOneOrder' })
  findOne(@Payload('id', ParseUUIDPipe) id: string) {
    return this.orderService.findOne(id);
  }

  @MessagePattern({ cmd: 'changeOrderStatus' })
  changeOrderStatus(@Payload() updateOrderDto: StatusOrderDto) {
    return this.orderService.changeOrderStatus(updateOrderDto);
  }

  @EventPattern('payment.success')
  paidOrder(@Payload() paymentSucces: PaymentSuccessDto) {
    console.log('paymentSucces', paymentSucces);
    return this.orderService.paidOrder(paymentSucces);
  }
}
