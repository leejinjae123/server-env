import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from '../../application/dto/order.dto';
import { PrismaService } from 'prisma/prisma.service';
import { UserService } from './user.service';
import { ProductService } from './product.service';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private productService: ProductService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const user = await this.userService.findById(createOrderDto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.$transaction(async (prisma) => {
      const products = await this.validateAndGetProducts(createOrderDto.items, prisma);
      const totalAmount = this.calculateTotalAmount(products, createOrderDto.items);
      
      await this.validateUserBalance(user.id, totalAmount);
      
      const order = await this.createOrder(
        user.id,
        totalAmount,
        createOrderDto.items,
        products,
        prisma
      );

      await this.updateStockAndBalance(
        user.id,
        totalAmount,
        createOrderDto.items,
        prisma
      );

      return order;
    });
  }

  private async validateAndGetProducts(items: Array<{ productId: number; quantity: number }>, prisma: any) {
    const products = await Promise.all(
      items.map(item =>
        prisma.product.findUnique({ where: { id: item.productId } })
      )
    );

    products.forEach((product, index) => {
      if (!product) {
        throw new NotFoundException(`Product ${items[index].productId} not found`);
      }
      if (product.stock < items[index].quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${items[index].productId}`
        );
      }
    });

    return products;
  }

  private calculateTotalAmount(
    products: Array<{ price: number }>,
    items: Array<{ quantity: number }>
  ): number {
    return products.reduce(
      (total, product, index) => total + product.price * items[index].quantity,
      0
    );
  }

  private async validateUserBalance(userId: number, totalAmount: number) {
    const user = await this.userService.findById(userId);
    if (user.balance < totalAmount) {
      throw new BadRequestException('Insufficient balance');
    }
  }

  private async createOrder(
    userId: number,
    totalAmount: number,
    items: Array<{ productId: number; quantity: number }>,
    products: Array<{ price: number }>,
    prisma: any
  ) {
    return prisma.order.create({
      data: {
        userId,
        totalAmount,
        status: 'COMPLETED',
        orderDate: new Date(),
        items: {
          create: items.map((item, index) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: products[index].price
          }))
        }
      },
      include: { items: true }
    });
  }

  private async updateStockAndBalance(
    userId: number,
    totalAmount: number,
    items: Array<{ productId: number; quantity: number }>,
    prisma: any
  ) {
    await Promise.all([
      prisma.user.update({
        where: { id: userId },
        data: { balance: { decrement: totalAmount } }
      }),
      ...items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      )
    ]);
  }
}
