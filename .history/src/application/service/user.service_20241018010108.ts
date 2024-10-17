import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '../../domain/user.entity';
import { ChargeBalanceDto } from '../../application/dto/balance.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async chargeBalance(dto: ChargeBalanceDto): Promise<User> {
    if (dto.amount <= 0) {
      throw new BadRequestException('Charge amount must be positive');
    }

    const user = await this.findById(dto.userId);

    return this.prisma.user.update({
      where: { id: dto.userId },
      data: { balance: { increment: dto.amount } }
    });
  }

  async checkBalance(userId: number, amount: number): Promise<boolean> {
    const user = await this.findById(userId);
    return user.balance >= amount;
  }
}