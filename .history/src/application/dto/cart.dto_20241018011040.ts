import { isNumber, Min } from "class-validator";

export class AddToCartDto {
    @isNumber()
    userId: number;
  
    @IsNumber()
    productId: number;
  
    @IsNumber()
    @Min(1)
    quantity: number;
  }