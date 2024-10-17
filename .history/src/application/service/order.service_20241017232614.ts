import { Injectable } from '@nestjs/common';
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
    if (!user) throw new Error('User not found');

    return this.prisma.$transaction(async (prisma) => {
      let totalAmount = 0;
      const products = await Promise.all(
        createOrderDto.items.map(item =>
          prisma.product.findUnique({ where: { id: item.productId } }),
        ),
      );

      // Validate stock and calculate total
      createOrderDto.items.forEach((item, index) => {
        const product = products[index];
        if (!product) throw new Error(`Product ${item.productId} not found`);
        if (product.stock < item.quantity)
          throw new Error(`Insufficient stock for product ${item.productId}`);
        totalAmount += product.price * item.quantity;
      });

      // Check balance
      if (user.balance < totalAmount)
        throw new Error('Insufficient balance');

      // Create order
      const order = await prisma.order.create({
        data: {
          userId: createOrderDto.userId,
          totalAmount,
          status: 'COMPLETED',
          orderDate: new Date(),
          items: {
            create: createOrderDto.items.map((item, index) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: products[index]!.price
            }))
          }
        },
        include: { items: true }
      });

      // Update stocks and balance
      await Promise.all([
        prisma.user.update({
          where: { id: user.id },
          data: { balance: { decrement: totalAmount } }
        }),
        ...createOrderDto.items.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          })
        )
      ]);

      return order;
    });
  }
}
