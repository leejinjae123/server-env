import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from './module/user.module';
import { ProductModule } from './module/product.module';
import { OrderModule } from './module/order.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    ProductModule,
    OrderModule
  ],
})
export class AppModule {}