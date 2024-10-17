import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { User } from '../../domain/user/user.entity';
import { ChargeBalanceDto } from '../../application/dto/balance.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(id: number): Promise<User> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async chargeBalance(dto: ChargeBalanceDto): Promise<User> {
    const user = await this.findById(dto.userId);
    if (!user) throw new Error('User not found');

    return this.prisma.user.update({
      where: { id: dto.userId },
      data: { balance: { increment: dto.amount } }
    });
  }
}