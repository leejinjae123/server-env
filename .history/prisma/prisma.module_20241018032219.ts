import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../src/util/prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}