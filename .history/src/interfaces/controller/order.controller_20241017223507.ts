import { Controller, Post, Body } from '@nestjs/common';
import { CreateOrderDto } from '../../application/dto/order.dto';
import { OrderService } from 'src/application/service/order.service';

@Controller('api/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    const order = await this.orderService.create(createOrderDto);
    return {
      orderId: order.id,
      totalAmount: order.totalAmount,
      status: order.status
    };
  }
}