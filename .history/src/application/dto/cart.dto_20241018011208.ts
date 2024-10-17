import { IsNumber, Min } from "class-validator";

export class AddToCartDto {
    @IsNumber()
    userId: number;
  
    @IsNumber()
    productId: number;
  
    @IsNumber()
    @Min(1)
    quantity: number;
  }