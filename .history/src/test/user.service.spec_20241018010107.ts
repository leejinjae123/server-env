import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UserService } from 'src/application/service/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { User } from 'src/domain/user.entity';
import { ChargeBalanceDto } from 'src/application/dto/balance.dto';

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  // Mock user data
  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    balance: 1000
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('findById', () => {
    it('should return a user if user exists', async () => {
      // Arrange
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      // Act
      const result = await userService.findById(1);

      // Assert
      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // Arrange
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(userService.findById(999)).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });
  });

  describe('chargeBalance', () => {
    it('should throw BadRequestException when amount is negative', async () => {
      // Arrange
      const chargeBalanceDto: ChargeBalanceDto = {
        userId: 1,
        amount: -100,
      };

      // Act & Assert
      await expect(userService.chargeBalance(chargeBalanceDto)).rejects.toThrow(
        new BadRequestException('Charge amount must be positive'),
      );
    });

    it('should throw BadRequestException when amount is zero', async () => {
      // Arrange
      const chargeBalanceDto: ChargeBalanceDto = {
        userId: 1,
        amount: 0,
      };

      // Act & Assert
      await expect(userService.chargeBalance(chargeBalanceDto)).rejects.toThrow(
        new BadRequestException('Charge amount must be positive'),
      );
    });

    it('should successfully charge balance when amount is positive', async () => {
      // Arrange
      const chargeBalanceDto: ChargeBalanceDto = {
        userId: 1,
        amount: 500,
      };
      
      const expectedBalance = mockUser.balance + chargeBalanceDto.amount;
      
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        ...mockUser,
        balance: expectedBalance,
      });

      // Act
      const result = await userService.chargeBalance(chargeBalanceDto);

      // Assert
      expect(result.balance).toBe(expectedBalance);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: chargeBalanceDto.userId },
        data: { balance: { increment: chargeBalanceDto.amount } },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      const chargeBalanceDto: ChargeBalanceDto = {
        userId: 999,
        amount: 100,
      };
      
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(userService.chargeBalance(chargeBalanceDto)).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });
  });

  describe('checkBalance', () => {
    it('should return true when user has sufficient balance', async () => {
      // Arrange
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      const amount = mockUser.balance - 100;

      // Act
      const result = await userService.checkBalance(mockUser.id, amount);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when user has insufficient balance', async () => {
      // Arrange
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      const amount = mockUser.balance + 100;

      // Act
      const result = await userService.checkBalance(mockUser.id, amount);

      // Assert
      expect(result).toBe(false);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(userService.checkBalance(999, 100)).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });
  });

  // Test error cases
  describe('error handling', () => {
    it('should handle database errors in findById', async () => {
      // Arrange
      jest.spyOn(prismaService.user, 'findUnique').mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(userService.findById(1)).rejects.toThrow('Database error');
    });

    it('should handle database errors in chargeBalance', async () => {
      // Arrange
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prismaService.user, 'update').mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(userService.chargeBalance({ userId: 1, amount: 100 })).rejects.toThrow('Database error');
    });
  });
});