import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../application/service/product.service';
import { PrismaService } from '../util/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ProductService', () => {
  let service: ProductService;
  let prismaService: PrismaService;

  // 모의 PrismaService 객체 만들기
  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    }
  };

  beforeEach(async () => {
    // 테스트 모듈 설정하기
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ],
    }).compile();

    // 서비스랑 의존성 주입하기
    service = module.get<ProductService>(ProductService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('서비스 정의됐는지 확인', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('모든 상품 반환하는지 테스트', async () => {
      // 테스트용 상품 데이터
      const mockProducts = [
        { id: 1, name: 'Product 1', price: 100, stock: 10 },
        { id: 2, name: 'Product 2', price: 200, stock: 20 }
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.findAll();

      // 결과 확인
      expect(result).toEqual(mockProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('ID로 상품 찾는지 테스트', async () => {
      // 테스트용 상품 데이터
      const mockProduct = { id: 1, name: 'Product 1', price: 100, stock: 10 };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findById(1);

      // 결과 확인
      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          _count: {
            select: { orderItems: true }
          }
        }
      });
    });

    it('상품 못 찾으면 NotFoundException 던지는지 테스트', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStock', () => {
    it('상품 재고 업데이트하는지 테스트', async () => {
      // 테스트용 상품 데이터
      const mockProduct = { id: 1, name: 'Product 1', price: 100, stock: 10 };
      const updatedProduct = { ...mockProduct, stock: 15 };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      const result = await service.updateStock(1, 5);

      // 결과 확인
      expect(result).toEqual(updatedProduct);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { stock: { increment: 5 } },
        include: {
          _count: {
            select: { orderItem: true }
          }
        }
      });
    });

    it('재고 부족하면 에러 던지는지 테스트', async () => {
      // 테스트용 상품 데이터
      const mockProduct = { id: 1, name: 'Product 1', price: 100, stock: 10 };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      await expect(service.updateStock(1, -15)).rejects.toThrow('Insufficient stock');
    });
  });
});