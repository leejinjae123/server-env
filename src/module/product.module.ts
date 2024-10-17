import { Module } from '@nestjs/common';
import { ProductService } from 'src/application/service/product.service';
import { ProductController } from 'src/interfaces/controller/product.controller';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}