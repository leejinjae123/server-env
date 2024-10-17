import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from 'prisma/prisma.module';
import { UserModule } from './module/user.module';
import { ProductModule } from './module/product.module';
import { OrderModule } from './module/order.module';
import { PrismaService } from 'src/util/prisma.service';
import { MockPrismaService } from './mock/mock-prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModule,
    ProductModule,
    OrderModule,
  ],
  providers: [
    {
      provide: PrismaService,
      useFactory: (configService: ConfigService) => {
        const useMockPrisma = configService.get('USE_MOCK_PRISMA');
        console.log('Using Mock Prisma:', useMockPrisma);
        return useMockPrisma === 'true' ? new MockPrismaService() : new PrismaService();
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}