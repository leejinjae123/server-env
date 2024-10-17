import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { UserModule } from './module/user.module';
import { ProductModule } from './module/product.module';
import { OrderModule } from './module/order.module';
import { PrismaService } from 'prisma/prisma.service';
import { MockPrismaService } from './mock/mock-prisma.service';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    ProductModule,
    OrderModule,
  ],
  providers: [
    {
      provide: PrismaService,
      useClass: process.env.USE_MOCK_PRISMA === 'true' ? MockPrismaService : PrismaService,  // 환경 변수에 따라 Mock 서비스 선택
    },
  ],
})
export class AppModule {}