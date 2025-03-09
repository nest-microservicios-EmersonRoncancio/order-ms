import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StatusOrderDto } from './dto/status-order.dto';

@Injectable()
export class OrderService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  create(createOrderDto: CreateOrderDto) {
    // const order = await this.order.create({
    //   data: createOrderDto,
    // });

    return createOrderDto;
  }

  async findAll(paginationDto: PaginationDto) {
    const orders = await this.order.findMany({
      skip: ((paginationDto.page ?? 1) - 1) * (paginationDto.limit ?? 10),
      take: paginationDto.limit,
      where: {
        status: paginationDto.status,
      },
    });

    return {
      data: orders,
      page: paginationDto.page,
      limit: paginationDto.limit,
    };
  }

  async findOne(id: string) {
    const order = await this.order.findUnique({
      where: {
        id: id,
      },
    });
    if (!order) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Order not found',
      });
    }

    return order;
  }

  async changeOrderStatus(updateOrderDto: StatusOrderDto) {
    const order = await this.order.findFirst({
      where: {
        id: updateOrderDto.id,
      },
    });
    if (!order) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Order not found',
      });
    }

    if (order.status === updateOrderDto.status) {
      return order;
    }

    const updatedOrder = await this.order.update({
      where: {
        id: updateOrderDto.id,
      },
      data: {
        status: updateOrderDto.status,
      },
    });

    return updatedOrder;
  }
}
