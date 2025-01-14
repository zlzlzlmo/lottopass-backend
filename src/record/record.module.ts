import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordController } from './record.controller';
import { RecordService } from './record.service';
import { RecordEntity } from './record.entity';
import { UserService } from 'src/user/user.service';
import { UserEntity } from 'src/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecordEntity, UserEntity])],
  controllers: [RecordController],
  providers: [RecordService, UserService],
})
export class RecordModule {}
