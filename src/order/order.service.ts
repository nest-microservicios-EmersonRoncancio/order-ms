import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StatusOrderDto } from './dto/status-order.dto';
import { firstValueFrom } from 'rxjs';
import { NATS_CLIENT } from 'src/configs';

interface Product {
  id: number;
  name: string;
  price: number;
  available: boolean;
  createdAt: string; // Puede usarse Date si se convierte antes de usarlo
  updatedAt: string;
}

@Injectable()
export class OrderService extends PrismaClient implements OnModuleInit {
  constructor(@Inject(NATS_CLIENT) private readonly client: ClientProxy) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async create(createOrderDto: CreateOrderDto) {
    try {
      const ids: number[] = createOrderDto.items.map((item) => item.productId);

      const products: Product[] = await firstValueFrom(
        this.client.send({ cmd: 'validate_products_ids' }, { ids: ids }),
      );

      const totalAmount = createOrderDto.items.reduce((acc, item) => {
        const price: number =
          products.find((products) => products.id === item.productId)?.price ??
          0;

        return acc + price * item.quantity;
      }, 0);

      const totalItems = createOrderDto.items.reduce(
        (acc, item) => acc + item.quantity,
        0,
      );

      const order = await this.order.create({
        data: {
          totalAmount: totalAmount,
          totalItems: totalItems,
          OrderItem: {
            createMany: {
              data: createOrderDto.items.map((item) => {
                return {
                  productId: item.productId,
                  quantity: item.quantity,
                  price:
                    products.find((product) => product.id === item.productId)
                      ?.price ?? 0,
                };
              }),
            },
          },
        },
        include: {
          OrderItem: {
            select: {
              productId: true,
              quantity: true,
              price: true,
            },
          },
        },
      });

      return {
        order: order,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error validating products or calculating total amount',
      });
    }
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
      include: {
        OrderItem: {
          select: {
            productId: true,
            quantity: true,
            price: true,
          },
        },
      },
    });
    if (!order) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Order not found',
      });
    }

    // const products: Product[] = await firstValueFrom(
    //   this.client.send(
    //     { cmd: 'validate_products_ids' },
    //     { ids: order.OrderItem.map((item) => item.productId) },
    //   ),
    // );

    return {
      order: order,
      // OrderItems: order.OrderItem.map((item) => {
      //   return {
      //     ...item,
      //     name:
      //       products.find((product) => product.id === item.productId)?.name ??
      //       'Product not found',
      //   };
      // }),
    };
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
