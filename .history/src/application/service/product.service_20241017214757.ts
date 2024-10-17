import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Product } from 'src/domain/product.entity';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    return this.prisma.product.findMany();
  }

  async findPopular(): Promise<Product[]> {
    return this.prisma.product.findMany({
      take: 5,
      orderBy: {
        OrderItem: {
          _count: 'desc'
        }
      },
      include: {
        _count: {
          select: { OrderItem: true }
        }
      }
    });
  }

  async updateStock(id: number, quantity: number): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: { stock: { increment: -quantity } }
    });
  }
}