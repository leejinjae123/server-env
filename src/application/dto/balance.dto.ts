import { IsNumber, Min } from 'class-validator';

export class ChargeBalanceDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  @Min(0)
  amount: number;
}