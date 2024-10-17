import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/util/prisma.service';
import { Product } from 'src/domain/product.entity';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    return this.prisma.product.findMany({
      include: {
        _count: {
          select: { orderItems: true }
        }
      }
    });
  }

  async findById(id: number): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orderItems: true }
        }
      }
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findPopular(limit = 5): Promise<Product[]> {
    return this.prisma.product.findMany({
      take: limit,
      orderBy: {
        orderItems: {
          _count: 'desc'
        }
      },
      include: {
        _count: {
          select: { orderItems: true }
        }
      }
    });
  }

  async updateStock(id: number, quantity: number): Promise<Product> {
    const product = await this.findById(id);
    
    if (product.stock + quantity < 0) {
      throw new Error('Insufficient stock');
    }

    return this.prisma.product.update({
      where: { id },
      data: { stock: { increment: quantity } },
      include: {
        _count: {
          select: { orderItems: true }
        }
      }
    });
  }
}