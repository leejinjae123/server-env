import { Controller, Get } from "@nestjs/common";
import { ProductService } from "src/application/service/product.service";

@Controller('api/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getProducts() {
    return this.productService.findAll();
  }

  @Get('popular')
  async getPopularProducts() {
    return this.productService.findPopular();
  }
}