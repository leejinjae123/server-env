import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderService } from 'src/application/service/order.service';
import { UserService } from 'src/application/service/user.service';
import { ProductService } from 'src/application/service/product.service';

describe('OrderService', () => {
  let service: OrderService;
  let prismaService: PrismaService;
  let userService: UserService;
  let productService: ProductService;

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

  const mockUserService = {
    findById: jest.fn()
  };

  const mockProductService = {
    findAll: jest.fn(),
    updateStock: jest.fn()
  };

  beforeEach(async () => {
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

    service = module.get<OrderService>(OrderService);
    prismaService = module.get<PrismaService>(PrismaService);
    userService = module.get<UserService>(UserService);
    productService = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const mockCreateOrderDto = {
      userId: 1,
      items: [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 }
      ]
    };

    const mockUser = {
      id: 1,
      balance: 1000
    };

    const mockProducts = [
      { id: 1, price: 100, stock: 5 },
      { id: 2, price: 200, stock: 3 }
    ];

    beforeEach(() => {
      mockUserService.findById.mockResolvedValue(mockUser);
      mockPrismaService.product.findUnique
        .mockResolvedValueOnce(mockProducts[0])
        .mockResolvedValueOnce(mockProducts[1]);
    });

    it('should create an order successfully', async () => {
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

      expect(result).toEqual(mockOrder);
      expect(mockPrismaService.order.create).toHaveBeenCalled();
      expect(mockPrismaService.user.update).toHaveBeenCalled();
      expect(mockPrismaService.product.update).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserService.findById.mockResolvedValue(null);

      await expect(service.create(mockCreateOrderDto)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException when insufficient balance', async () => {
      mockUserService.findById.mockResolvedValue({ ...mockUser, balance: 100 });

      await expect(service.create(mockCreateOrderDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });
});