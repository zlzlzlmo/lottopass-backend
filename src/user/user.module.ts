import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntitiy } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntitiy])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
