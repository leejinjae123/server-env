import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UserService } from 'src/application/service/user.service';
import { User } from 'src/domain/user.entity';
import { ChargeBalanceDto } from 'src/application/dto/balance.dto';
import { PrismaService } from 'prisma/prisma.service';

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  // 테스트용 유저 데이터
  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    balance: 1000,
  };

  beforeEach(async () => {
    // 테스트 모듈 설정
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

    // 서비스랑 의존성 주입
    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('findById', () => {
    it('유저 있으면 찾아서 반환하는지 테스트', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await userService.findById(1);

      // 결과 확인
      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('유저 없으면 NotFoundException 던지는지 테스트', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(userService.findById(999)).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });
  });

  describe('chargeBalance', () => {
    it('충전 금액 음수면 BadRequestException 던지는지 테스트', async () => {
      const chargeBalanceDto: ChargeBalanceDto = {
        userId: 1,
        amount: -100,
      };

      await expect(userService.chargeBalance(chargeBalanceDto)).rejects.toThrow(
        new BadRequestException('Charge amount must be positive'),
      );
    });

    it('충전 금액 0이면 BadRequestException 던지는지 테스트', async () => {
      const chargeBalanceDto: ChargeBalanceDto = {
        userId: 1,
        amount: 0,
      };

      await expect(userService.chargeBalance(chargeBalanceDto)).rejects.toThrow(
        new BadRequestException('Charge amount must be positive'),
      );
    });

    it('충전 금액 양수면 잘 충전되는지 테스트', async () => {
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

      const result = await userService.chargeBalance(chargeBalanceDto);

      // 결과 확인
      expect(result.balance).toBe(expectedBalance);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: chargeBalanceDto.userId },
        data: { balance: { increment: chargeBalanceDto.amount } },
      });
    });

    it('충전할 유저 없으면 NotFoundException 던지는지 테스트', async () => {
      const chargeBalanceDto: ChargeBalanceDto = {
        userId: 999,
        amount: 100,
      };
      
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(userService.chargeBalance(chargeBalanceDto)).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });
  });

  describe('checkBalance', () => {
    it('잔액 충분하면 true 반환하는지 테스트', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      const amount = mockUser.balance - 100;

      const result = await userService.checkBalance(mockUser.id, amount);

      expect(result).toBe(true);
    });

    it('잔액 부족하면 false 반환하는지 테스트', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      const amount = mockUser.balance + 100;

      const result = await userService.checkBalance(mockUser.id, amount);

      expect(result).toBe(false);
    });

    it('유저 없으면 NotFoundException 던지는지 테스트', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(userService.checkBalance(999, 100)).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });
  });

  // 에러 처리 테스트
  describe('error handling', () => {
    it('findById에서 DB 에러 처리하는지 테스트', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockRejectedValue(new Error('Database error'));

      await expect(userService.findById(1)).rejects.toThrow('Database error');
    });

    it('chargeBalance에서 DB 에러 처리하는지 테스트', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prismaService.user, 'update').mockRejectedValue(new Error('Database error'));

      await expect(userService.chargeBalance({ userId: 1, amount: 100 })).rejects.toThrow('Database error');
    });
  });
});