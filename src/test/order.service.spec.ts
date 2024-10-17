import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../util/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderService } from 'src/application/service/order.service';
import { UserService } from 'src/application/service/user.service';
import { ProductService } from 'src/application/service/product.service';

describe('OrderService', () => {
  let service: OrderService;
  let prismaService: PrismaService;
  let userService: UserService;
  let productService: ProductService;

  // 모의 PrismaService 객체 만들기
  const mockPrismaService = {
    $transaction: jest.fn(callback => callback(mockPrismaService)),
    product: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    order: {
      create: jest.fn()
    },
    user: {
      update: jest.fn()
    }
  };

  // 모의 UserService 객체 만들기
  const mockUserService = {
    findById: jest.fn()
  };

  // 모의 ProductService 객체 만들기
  const mockProductService = {
    findAll: jest.fn(),
    updateStock: jest.fn()
  };

  beforeEach(async () => {
    // 테스트 모듈 설정
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        },
        {
          provide: UserService,
          useValue: mockUserService
        },
        {
          provide: ProductService,
          useValue: mockProductService
        }
      ],
    }).compile();

    // 서비스 및 의존성 주입
    service = module.get<OrderService>(OrderService);
    prismaService = module.get<PrismaService>(PrismaService);
    userService = module.get<UserService>(UserService);
    productService = module.get<ProductService>(ProductService);
  });

  it('서비스가 정의되어 있는지 확인', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    // 테스트용 주문 생성 DTO
    const mockCreateOrderDto = {
      userId: 1,
      items: [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 }
      ]
    };

    // 테스트용 사용자 데이터
    const mockUser = {
      id: 1,
      balance: 1000
    };

    // 테스트용 상품 데이터
    const mockProducts = [
      { id: 1, price: 100, stock: 5 },
      { id: 2, price: 200, stock: 3 }
    ];

    beforeEach(() => {
      // 각 테스트 전에 모의 함수 설정
      mockUserService.findById.mockResolvedValue(mockUser);
      mockPrismaService.product.findUnique
        .mockResolvedValueOnce(mockProducts[0])
        .mockResolvedValueOnce(mockProducts[1]);
    });

    it('주문 성공적으로 생성하는지 테스트', async () => {
      // 테스트용 주문 결과 데이터
      const mockOrder = {
        id: 1,
        userId: 1,
        totalAmount: 400,
        status: 'COMPLETED',
        items: [
          { productId: 1, quantity: 2, price: 100 },
          { productId: 2, quantity: 1, price: 200 }
        ]
      };

      mockPrismaService.order.create.mockResolvedValue(mockOrder);

      const result = await service.create(mockCreateOrderDto);

      // 결과 확인
      expect(result).toEqual(mockOrder);
      expect(mockPrismaService.order.create).toHaveBeenCalled();
      expect(mockPrismaService.user.update).toHaveBeenCalled();
      expect(mockPrismaService.product.update).toHaveBeenCalledTimes(2);
    });

    it('사용자 못 찾을 때 NotFoundException 던지는지 테스트', async () => {
      mockUserService.findById.mockResolvedValue(null);

      await expect(service.create(mockCreateOrderDto)).rejects.toThrow(
        NotFoundException
      );
    });

    it('잔액 부족할 때 BadRequestException 던지는지 테스트', async () => {
      mockUserService.findById.mockResolvedValue({ ...mockUser, balance: 100 });

      await expect(service.create(mockCreateOrderDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });
});