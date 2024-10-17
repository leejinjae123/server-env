import { Module } from '@nestjs/common';
import { UserService } from 'src/application/service/user.service';
import { UserController } from 'src/interfaces/controller/user.controller';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}