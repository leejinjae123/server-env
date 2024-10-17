import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../application/service/product.service';
import { PrismaService } from 'prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ProductService', () => {
  let service: ProductService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', price: 100, stock: 10 },
        { id: 2, name: 'Product 2', price: 200, stock: 20 }
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.findAll();

      expect(result).toEqual(mockProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a product by id', async () => {
      const mockProduct = { id: 1, name: 'Product 1', price: 100, stock: 10 };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findById(1);

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          _count: {
            select: { OrderItem: true }
          }
        }
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStock', () => {
    it('should update product stock', async () => {
      const mockProduct = { id: 1, name: 'Product 1', price: 100, stock: 10 };
      const updatedProduct = { ...mockProduct, stock: 15 };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      const result = await service.updateStock(1, 5);

      expect(result).toEqual(updatedProduct);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { stock: { increment: 5 } },
        include: {
          _count: {
            select: { OrderItem: true }
          }
        }
      });
    });

    it('should throw error when insufficient stock', async () => {
      const mockProduct = { id: 1, name: 'Product 1', price: 100, stock: 10 };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      await expect(service.updateStock(1, -15)).rejects.toThrow('Insufficient stock');
    });
  });
});