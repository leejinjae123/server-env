import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ChargeBalanceDto } from 'src/application/dto/balance.dto';
import { UserService } from 'src/application/service/user.service';

@Controller('api/balance')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('charge')
  async chargeBalance(@Body() chargeBalanceDto: ChargeBalanceDto) {
    return this.userService.chargeBalance(chargeBalanceDto);
  }

  @Get(':userId')
  async getBalance(@Param('userId', ParseIntPipe) userId: number) {
    const user = await this.userService.findById(userId);
    return { userId: user.id, balance: user.balance };
  }
}