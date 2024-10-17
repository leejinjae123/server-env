import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { UserModule } from './module/user.module';
import { ProductModule } from './module/product.module';
import { OrderModule } from './module/order.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    ProductModule,
    OrderModule,
    {
      provide: PrismaService,
      useClass: process.env.USE_MOCK_PRISMA === 'true' ? MockPrismaService : PrismaService,
    },
  ],
})
export class AppModule {}