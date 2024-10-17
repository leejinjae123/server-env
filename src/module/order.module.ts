import { Module } from '@nestjs/common';
import { ProductModule } from './product.module';
import { UserModule } from './user.module';
import { OrderController } from 'src/interfaces/controller/order.controller';
import { OrderService } from 'src/application/service/order.service';

@Module({
  imports: [UserModule, ProductModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}